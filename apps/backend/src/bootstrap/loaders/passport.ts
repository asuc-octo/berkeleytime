import { RedisStore } from "connect-redis";
import type { Application } from "express";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import type { RedisClientType } from "redis";

import { UserModel } from "@repo/common/models";

import { config } from "../../../../../packages/common/src/utils/config";

const LOGIN_ROUTE = "/login";
const LOGIN_REDIRECT_ROUTE = "/login/redirect";
const LOGOUT_ROUTE = "/logout";

// route need to be added as authorized origins/redirect uris in google cloud console
// OAuth requires an absolute callback URL (e.g. https://berkeleytime.com/api/login/redirect)
const backendBase = (config.backendPublicUrl ?? config.backendPath).replace(
  /\/$/,
  ""
);
const LOGIN_REDIRECT = backendBase + "/login/redirect";
const SUCCESS_REDIRECT = "/";
const FAILURE_REDIRECT = backendBase + "/fail";

const SCOPE = ["profile", "email"];

const CACHE_PREFIX = "user-session:";

const ANONYMOUS_SESSION_TTL = 1000 * 60 * 60 * 12;
const AUTHENTICATED_SESSION_TTL = 1000 * 60 * 60 * 24 * 365;

function safeRedirect(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const url = new URL(value);
    const isBerkeleytime =
      url.protocol === "https:" &&
      (url.hostname === "berkeleytime.com" ||
        url.hostname.endsWith(".berkeleytime.com"));
    const isLocalDevelopment =
      config.isDev &&
      (url.protocol === "http:" || url.protocol === "https:") &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    return isBerkeleytime || isLocalDevelopment ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async (app: Application, redis: RedisClientType) => {
  // init
  app.use(
    session({
      secret: config.SESSION_SECRET,
      name: "bt.sid",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: !config.isDev,
        httpOnly: true,
        maxAge: ANONYMOUS_SESSION_TTL,
        sameSite: "lax",
        domain: config.isDev ? undefined : ".berkeleytime.com",
      },
      store: new RedisStore({
        client: redis,
        prefix: CACHE_PREFIX,
      }),
      rolling: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // routes
  app.get(LOGIN_ROUTE, (req, res, next) => {
    const authenticated = req.isAuthenticated();

    const { redirect_uri: redirectURI } = req.query;

    const parsedRedirectURI = safeRedirect(redirectURI);

    if (authenticated) {
      res.redirect(parsedRedirectURI ?? SUCCESS_REDIRECT);

      return;
    }

    const authenticator = passport.authenticate("google", {
      scope: SCOPE,
      accessType: "offline",
      prompt: "consent",
      state: parsedRedirectURI
        ? Buffer.from(
            JSON.stringify({ redirectURI: parsedRedirectURI })
          ).toString("base64")
        : undefined,
    });

    authenticator(req, res, next);
  });
  app.get(LOGIN_REDIRECT_ROUTE, (req, res, next) => {
    passport.authenticate(
      "google",
      (err: Error | null, user: Express.User | false) => {
        if (err) {
          // Log OAuth token exchange errors (e.g. redirect_uri_mismatch, invalid_grant) for debugging
          const oauthCode =
            "oauthError" in err
              ? String(
                  (err as { oauthError?: { code?: string } }).oauthError?.code
                )
              : "";
          console.error(
            "[OAuth] Token exchange failed:",
            err.message,
            oauthCode || "",
            "callbackURL:",
            LOGIN_REDIRECT
          );
          return res.redirect(FAILURE_REDIRECT);
        }
        if (!user) {
          return res.redirect(FAILURE_REDIRECT);
        }
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("[OAuth] req.login failed:", loginErr);
            return res.redirect(FAILURE_REDIRECT);
          }
          if (req.session?.cookie) {
            req.session.cookie.maxAge = AUTHENTICATED_SESSION_TTL;
          }

          const { state } = req.query;

          let parsedRedirectURI: string | undefined;

          try {
            const { redirectURI } = JSON.parse(
              Buffer.from(state as string, "base64").toString()
            );

            parsedRedirectURI = safeRedirect(redirectURI) ?? undefined;
          } catch {
            // Do nothing
          }

          res.redirect(parsedRedirectURI ?? SUCCESS_REDIRECT);
        });
      }
    )(req, res, next);
  });
  app.get(LOGOUT_ROUTE, (req, res) => {
    req.logout((err) => {
      if (err) {
        res.redirect(FAILURE_REDIRECT);

        return;
      }

      const { redirect_uri: redirectURI } = req.query;

      const parsedRedirectURI = safeRedirect(redirectURI);

      res.redirect(parsedRedirectURI ?? SUCCESS_REDIRECT);
    });
  });

  // config
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser(async (user: { _id: string } | undefined, done) => {
    try {
      if (!user?._id) {
        done(null, user);
        return;
      }
      const fresh = await UserModel.findOneAndUpdate(
        { _id: user._id },
        { lastSeenAt: new Date() },
        { new: true }
      ).lean();
      done(null, fresh ?? user);
    } catch (error) {
      done(error as Error);
    }
  });
  passport.use(
    new GoogleStrategy.Strategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: LOGIN_REDIRECT,
      },
      async (_, __, profile, done) => {
        const email = profile.emails?.[0].value;

        if (!email) {
          return done(null, false, { message: "Invalid" });
        }

        let user = await UserModel.findOne({ email });

        if (!user) {
          user = new UserModel({
            email,
            googleId: profile.id,
            name: profile.displayName,
            lastSeenAt: new Date(),
          });
        } else {
          user.name = profile.displayName;
          user.lastSeenAt = new Date();
        }

        const doc = await user.save();

        done(null, doc);
      }
    )
  );

  // DEV-ONLY: Direct user login without Google OAuth
  if (config.isDev) {
    const DEV_LOGIN_ROUTE = "/dev/login";
    const DEV_USERS_ROUTE = "/dev/users";

    // GET /dev/login?userId=xxx&redirect_uri=/
    app.get(DEV_LOGIN_ROUTE, async (req, res) => {
      const { userId, redirect_uri: redirectURI } = req.query;

      const parsedRedirectURI = safeRedirect(redirectURI) ?? "/";

      const redirectWithDevAuthError = (reason: string) => {
        const separator = parsedRedirectURI.includes("?") ? "&" : "?";
        return `${parsedRedirectURI}${separator}devAuthError=${encodeURIComponent(
          reason
        )}`;
      };

      const failDevLogin = (reason: string) => {
        if (req.session?.cookie) {
          req.session.cookie.maxAge = 0;
        }
        res.redirect(redirectWithDevAuthError(reason));
      };

      if (!userId || typeof userId !== "string") {
        failDevLogin("invalid_user_id");
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        failDevLogin("user_not_found");
        return;
      }

      const sessionUser = { _id: user._id.toString(), email: user.email };

      req.login(sessionUser, (err) => {
        if (err) {
          failDevLogin("login_failed");
          return;
        }

        if (req.session?.cookie) {
          req.session.cookie.maxAge = AUTHENTICATED_SESSION_TTL;
        }

        res.redirect(parsedRedirectURI);
      });
    });

    // GET /dev/users - List available users for selection
    app.get(DEV_USERS_ROUTE, async (_req, res) => {
      const users = await UserModel.find({}).select("_id email name staff");

      res.json(users);
    });
  }
};
