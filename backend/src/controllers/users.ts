import axios from "axios";
import passport from "passport";

import { URL_VERIFY_GOOGLE_TOKEN } from "#src/config";
import { User_Model } from "#src/models/_index";
import { ExpressMiddleware } from "#src/types";

import "@colors/colors";

// import { DocumentType } from "@typegoose/typegoose";
// type LoginRequest = { email: string; password: string };
// type LoginResponse = { success: boolean };
// type RegisterRequest = {
//   email: string;
//   name: string;
//   password: string;
//   password_confirm: string;
// };
// type RegisterResponse = { success: boolean };
interface IController {
  // login: ExpressMiddleware<LoginRequest, LoginResponse>;
}
// async activate(req, res): Promise<DocumentType<User_Schema>> {

export const Users = new (class Controller implements IController {
  adminCheck: ExpressMiddleware<{}, {}> = async (req, res) => {
    if (!req.user.admin) {
      res.json(403);
    }
  };

  current: ExpressMiddleware<{}, {}> = async (req, res) => {
    res.json({ user: req.user.toJSON() });
  };

  delete: ExpressMiddleware<{}, {}> = async (req, res) => {
    // const { google_id } = req.user
    // await User.deleteOne({ google_id })
    // res.json({ success: true })

    await User_Model.deleteOne({ _id: req.user.id });
    res.json({ success: true });
  };

  googleCallback: ExpressMiddleware<{}, {}> = async (req, res) => {
    const { idToken, accessToken } = req.body;
    const { data } = await axios.get(`${URL_VERIFY_GOOGLE_TOKEN}`, {
      params: {
        id_token: idToken,
      },
    });
    const {
      iss,
      azp,
      aud,
      sub,
      hd,
      email,
      email_verified,
      iat,
      exp,
      jti,
      alg,
      kid,
      typ,
    } = data; // TODO: Can we type this and rename fields for readability
    if (hd != "berkeley.edu") {
      return res
        .status(400)
        .json({ msg: `account must be from 'berkeley.edu'` });
    }
    let user = await User_Model.findOne({
      google_id: sub,
    });
    if (!user) {
      user = new User_Model({
        email,
        google_id: sub,
        access_token: accessToken,
      });
    } else {
      user.access_token = req.body.accessToken;
    }
    user = await user.save();
    return res.json({ success: true, user });
  };
})();
