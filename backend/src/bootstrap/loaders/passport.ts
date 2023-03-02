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
import { UserModel } from "../../modules/user/model";

// routes need to be added as authorized origins/redirect uris in google cloud console
const LOGIN_ROUTE = "/auth/google";
const CALLBACK_ROUTE = "/auth/google/callback";

const SUCCESS_REDIRECT = "/graphql";
const FAILURE_REDIRECT = "/fail";

const SCOPE = ['profile', 'email']

export default async (app: Application) => {
  // init
  app.use(session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: true,
      maxAge: 1000 * 60 * 60 // 1 hour
    },
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
  // TODO: success and failure redirect route
  app.get(CALLBACK_ROUTE, passport.authenticate('google', {
    failureRedirect: FAILURE_REDIRECT,
    successRedirect: SUCCESS_REDIRECT,
  }));

  // config
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
  passport.use(new GoogleStrategy.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: CALLBACK_ROUTE,
    scope: SCOPE,
    state: true,
  }, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0].value;

    // null check for type safety
    if (!email) {
      return done(null, false, { message: 'No email found' });
    }

    let user = await UserModel.findOne({ email } );

    if (!user) {
      user = await new UserModel({
        email,
        username: profile.displayName,
        first_name: profile.name?.givenName || '',
        last_name: profile.name?.familyName || '',
        refresh_token: refreshToken,
      });
    }

    done(null, user);
  }));
}

