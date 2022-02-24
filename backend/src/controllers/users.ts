import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import passport from "passport";

import { EXPIRE_TIME_ACTIVATION_EMAIL, KEY_BERKELEYTIME } from "#src/config";
import jwt from "#src/helpers/jwt";
import { User_Model, User_Schema } from "#src/models/_index";
import sendActivationEmail from "#src/services/sendgrid";
import { ExpressMiddleware } from "#src/types";

import { DocumentType } from "@typegoose/typegoose";

// ! FIXME: Not all user routes have been tested yet
// TODO: Organize types, add validation

type LoginRequest = { email: string; password: string };
type LoginResponse = { success: boolean };

type RegisterRequest = {
  email: string;
  name: string;
  password: string;
  password_confirm: string;
};
type RegisterResponse = { success: boolean };

interface IController {
  login: ExpressMiddleware<LoginRequest, LoginResponse>;
}

export const Users = new (class Controller implements IController {
  async activate(req, res): Promise<DocumentType<User_Schema>> {
    const { token } = req.params;
    let errors: any = {};
    let decoded;
    try {
      decoded = await jwt.verify(token, KEY_BERKELEYTIME);
    } catch (err) {
      return res.status(422).json({
        activation:
          "Activation token has expired! Register again with the same email address",
      });
    }
    const user = await User_Model.findById(decoded.id);
    if (!user) {
      errors.user = "User not found";
      return res.status(422).json(errors);
    }
    if (user.activated) {
      errors.activation = "User is already activated";
      return res.status(422).json(errors);
    }
    user.activated = true;
    req.user = await user.save();
    return res.json({
      user: req.user,
    });
  }

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

  login: ExpressMiddleware<LoginRequest, LoginResponse> = async (req, res) => {
    let { email, password } = req.body;
    let errors: any = {};
    email = email.toLowerCase();

    const user = await User_Model.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = user.toJSON();
      if (!user.activated) {
        errors.activation = `Account has not been activated yet. Check your inbox at ${email}`;
        return res.status(403).json(errors);
      }

      const token = await jwt.sign(payload, KEY_BERKELEYTIME);
      return res.json({
        success: true,
        jwt: token,
      });
    }
    return res.status(400).json({ success: false, message: "Login failed" });
  };

  register: ExpressMiddleware<RegisterRequest, RegisterResponse> = async (
    req,
    res
  ) => {
    let { email, name, password } = req.body;
    let errors: any = {};
    email = email.toLowerCase();

    await mongoose.connection.transaction(async (session) => {
      const user = await User_Model.findOne({ email }).session(session);
      if (
        user &&
        (user.activated ||
          (!user.activated &&
            Date.now().valueOf() - user._created.valueOf() <
              EXPIRE_TIME_ACTIVATION_EMAIL))
      ) {
        errors.email = "User with that email already exists";
        return res.status(422).json(errors);
      }
      if (user) {
        await User_Model.deleteOne({ _id: user.id }).session(session);
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const newUser = new User_Model({
        email,
        name,
        password: hash,
      });
      const activationToken = await jwt.sign(
        { id: newUser.id },
        KEY_BERKELEYTIME,
        {
          expiresIn: EXPIRE_TIME_ACTIVATION_EMAIL / 1000,
        }
      );
      newUser.activation_token = activationToken;
      console.info(
        `ACTIVATION TOKEN for USER ${newUser.email}: ${newUser.activation_token}`
          .red
      );
      await sendActivationEmail({
        email: newUser.email,
        activationToken,
      });
      const savedUser = await newUser.save({ session });
      return res.json({ user: savedUser });
    });
  };

  exists: ExpressMiddleware<{}, {}> = async (req, res) => {
    let { email } = req.params;
    email = email.toLowerCase();

    const user = await User_Model.findOne({ email });
    if (user) {
      res.json({
        success: true,
        msg: `User ${email} exists`,
      });
    }
    return res.json({
      success: false,
      msg: `User with the given email address of ${email} does not exist`,
    });
  };

  googleAuthorize: ExpressMiddleware<{}, {}> = async ({}, {}) => {
    passport.authenticate("google", {
      accessType: "offline",
      hd: "berkeley.edu",
      prompt: "consent",
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/calendar.app.created",
        "https://www.googleapis.com/auth/calendar.freebusy",
      ],
      session: false,
    });
  };

  googleCallback: ExpressMiddleware<{}, {}> = async (req, res) => {
    const { google_id } = req.user;
    const user = await User_Model.findOne({ google_id });
    const userToken = await jwt.sign(user.toJSON(), KEY_BERKELEYTIME);
    user.jwt = userToken;
    await user.save();
    return res.json({ success: true, jwt: userToken });
  };
})();
