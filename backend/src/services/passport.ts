import passport from "passport";
import { Strategy as GoogleTokenStrategy } from "passport-google-verify-token";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import { KEY_GOOGLE_CLIENT_ID } from "#src/config";
import { User_Model } from "#src/models/_index";

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: KEY_GOOGLE_CLIENT_ID,
    },
    async (parsedToken, googleId, done) => {
      console.log(parsedToken, googleId);
      const { iss, azp, aud, sub, hd, email, email_verified, iat, exp, jti } =
        parsedToken;
      if (hd != "berkeley.edu") {
        done(null, false);
      }
      if (!googleId) {
        done(null, false, { message: "authentication failed" });
      }
      const user = await User_Model.findOne({ google_id: googleId });
      if (!user) {
        done(null, false, { message: "authentication failed" });
      }
      done(null, user);
    }
  )
);
