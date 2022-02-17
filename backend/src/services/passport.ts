import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import { KEY_BERKELEYTIME } from "#src/config";
import { User } from "#src/models/_index";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: KEY_BERKELEYTIME,
    },
    async (req, jwtPayload, done) => {
      const { id } = jwtPayload;
      if (id) {
        const user = await User.findById(id);
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      } else {
        done(null, false, { message: "authentication failed" });
      }
    }
  )
);
