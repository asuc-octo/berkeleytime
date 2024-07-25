/**
 * package.json override for oauth is to resolve package dependency issues in passport-google-oauth20 and
 * passport-aouth2. Once these packages are updated, this override can be removed.
 *
 * Opened pull request: https://github.com/jaredhanson/passport-oauth2/pull/165
 */
import RedisStore from "connect-redis";
import type { Application } from "express";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import type { RedisClientType } from "redis";

import { UserModel } from "@repo/common";

import { config } from "../../config";

const LOGIN_ROUTE = "/login";
const LOGIN_REDIRECT_ROUTE = "/login/redirect";
const LOGOUT_ROUTE = "/logout";

// route need to be added as authorized origins/redirect uris in google cloud console
const LOGIN_REDIRECT = config.backendPath + "/login/redirect";
const SUCCESS_REDIRECT = "/";
const FAILURE_REDIRECT = config.backendPath + "/fail";

const SCOPE = ["profile", "email"];

const CACHE_PREFIX = "user-session:";

export default async (app: Application, redis: RedisClientType) => {
  // init
  app.use(
    session({
      secret: config.SESSION_SECRET,
      name: "sessionId",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: !config.isDev,
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour
        sameSite: "lax",
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
      typeof redirectURI === "string" && redirectURI.startsWith("/")
        ? redirectURI
        : null;

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
      const { state } = req.query;

      let parsedRedirectURI;

      try {
        const { redirectURI } = JSON.parse(
          Buffer.from(state as string, "base64").toString()
        );

        parsedRedirectURI =
          typeof redirectURI === "string" && redirectURI.startsWith("/")
            ? redirectURI
            : undefined;
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
  passport.deserializeUser((user: any, done) => {
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

        // null check for type safety
        if (!email) {
          return done(null, false, { message: "No email found" });
        }

        let user = await UserModel.findOne({ email });

        if (!user) {
          user = new UserModel({
            email,
            google_id: profile.id,
            username: profile.displayName,
            first_name: profile.name?.givenName || "",
            last_name: profile.name?.familyName || "",
            // refresh_token: refreshToken, <-------------- currently not needed.
          });
        }

        user.last_login = new Date();
        const doc = await user.save();

        done(null, doc);
      }
    )
  );
};
