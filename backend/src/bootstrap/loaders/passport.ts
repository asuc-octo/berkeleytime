/**
 * package.json override for oauth is to resolve package dependency issues in passport-google-oauth20 and
 * passport-aouth2. Once these packages are updated, this override can be removed.
 *
 * Opened pull request: https://github.com/jaredhanson/passport-oauth2/pull/165
 */

import type { Application } from "express";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import RedisStore from "connect-redis";
import { UserModel } from "../../db/user";
import { config } from "../../config";
import { redisInstance } from "./redis";

const LOGIN_ROUTE = "/login";
const LOGIN_REDIRECT_ROUTE = "/login/redirect";
const LOGOUT_ROUTE = "/logout";

// route need to be added as authorized redirect uris in google cloud console
const LOGIN_REDIRECT = config.backendPath + LOGIN_REDIRECT_ROUTE; // must be prefixed with backend path
const SUCCESS_REDIRECT = config.backendPath + "/graphql";
const FAILURE_REDIRECT = config.backendPath + "/fail";

const SCOPE = ['profile', 'email']

const CACHE_PREFIX = 'user-session:';

export default (app: Application) => {
  // init
  app.use(session({
    secret: config.SESSION_SECRET,
    name: 'sessionId',
    store: new RedisStore({
      client: redisInstance,
      prefix: CACHE_PREFIX,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: !config.isDev,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 // 1 hour
    },
    rolling: true,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // routes
  app.get(LOGIN_ROUTE, (req, res, next) => {
    // check if user is already logged in
    if (req.isAuthenticated()) {
      res.redirect(SUCCESS_REDIRECT);
    } else {
      next();
    }
  }, passport.authenticate('google', {
    scope: SCOPE,
    accessType: 'offline',
    prompt: 'consent',
  }));
  app.get(LOGIN_REDIRECT_ROUTE, passport.authenticate('google', {
    failureRedirect: FAILURE_REDIRECT,
    // failureMessage: "failed",
    successRedirect: SUCCESS_REDIRECT,
  }));
  app.get(LOGOUT_ROUTE, (req, res) => {
    req.logout((err) => {
      if (err) {
        res.redirect(FAILURE_REDIRECT);
      } else {
        res.redirect(SUCCESS_REDIRECT);
      }
    });
  });

  // config
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
  passport.use(new GoogleStrategy.Strategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: LOGIN_REDIRECT,
    scope: SCOPE,
    state: true,
  }, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0].value;

    // null check for type safety
    if (!email) {
      return done(null, false, { message: 'No email found' });
    }

    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await new UserModel({
        email,
        google_id: profile.id,
        username: profile.displayName,
        first_name: profile.name?.givenName || '',
        last_name: profile.name?.familyName || '',
        // refresh_token: refreshToken, <-------------- currently not needed.
      });
    }

    user.last_login = new Date();
    user.save();

    done(null, user);
  }));
}
