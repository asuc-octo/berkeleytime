import { RedisStore } from "connect-redis";
import type { Application } from "express";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import type { RedisClientType } from "redis";

import { UserModel } from "@repo/common";

import { config } from "../../../../../packages/common/src/utils/config";

const LOGIN_ROUTE = "/login";
const LOGIN_REDIRECT_ROUTE = "/login/redirect";
const LOGOUT_ROUTE = "/logout";

// route need to be added as authorized origins/redirect uris in google cloud console
const LOGIN_REDIRECT = config.backendPath + "/login/redirect";
const SUCCESS_REDIRECT = "/";
const FAILURE_REDIRECT = config.backendPath + "/fail";

const SCOPE = ["profile", "email"];

const CACHE_PREFIX = "user-session:";

const ANONYMOUS_SESSION_TTL = 1000 * 60 * 60 * 12;
const AUTHENTICATED_SESSION_TTL = 1000 * 60 * 60 * 24 * 365;

export default async (app: Application, redis: RedisClientType) => {
  // init
  app.use(
    session({
      secret: config.SESSION_SECRET,
      name: "bt.sid",
      resave: false,
      saveUninitialized: true,
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

    const parsedRedirectURI =
      typeof redirectURI === "string" ? redirectURI : null;

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
  app.get(
    LOGIN_REDIRECT_ROUTE,
    passport.authenticate("google", {
      failureRedirect: FAILURE_REDIRECT,
    }),
    (req, res) => {
      if (req.session?.cookie) {
        req.session.cookie.maxAge = AUTHENTICATED_SESSION_TTL;
      }

      const { state } = req.query;

      let parsedRedirectURI;

      try {
        const { redirectURI } = JSON.parse(
          Buffer.from(state as string, "base64").toString()
        );

        parsedRedirectURI =
          typeof redirectURI === "string" ? redirectURI : undefined;
      } catch {
        // Do nothing
      }

      res.redirect(parsedRedirectURI ?? SUCCESS_REDIRECT);
    }
  );
  app.get(LOGOUT_ROUTE, (req, res) => {
    req.logout((err) => {
      if (err) {
        res.redirect(FAILURE_REDIRECT);

        return;
      }

      const { redirect_uri: redirectURI } = req.query;

      const parsedRedirectURI =
        typeof redirectURI === "string" && redirectURI.startsWith("/")
          ? redirectURI
          : null;

      res.redirect(parsedRedirectURI ?? SUCCESS_REDIRECT);
    });
  });

  // config
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser(async (user: any, done) => {
    if (user?._id) {
      await UserModel.updateOne({ _id: user._id }, { lastSeenAt: new Date() });
    }
    done(null, user);
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
};
