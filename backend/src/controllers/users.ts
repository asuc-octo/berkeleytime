import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import passport from "passport"

import { EXPIRE_TIME_ACTIVATION_EMAIL, KEY_BERKELEYTIME } from "#src/config"
import jwt from "#src/helpers/jwt"
import { User } from "#src/models/_index"
import sendActivationEmail from "#src/services/sendgrid"
import { ExpressMiddleware } from "#src/types"

// ! FIXME: Not all routes have been tested yet
// TODO: Organize types, add validation

type LoginRequest = { email: string; password: string }
type LoginResponse = { success: boolean }

type RegisterRequest = {
  email: string
  name: string
  password: string
  password_confirm: string
}
type RegisterResponse = { success: boolean }

interface IController {
  login: ExpressMiddleware<LoginRequest, LoginResponse>
}

export const Users = new (class Controller implements IController {
  current: ExpressMiddleware<{}, {}> = async (req, res) => {
    res.json({ user: req.user.toJSON() })
  }

  login: ExpressMiddleware<LoginRequest, LoginResponse> = async (req, res) => {
    let { email, password } = req.body
    email = email.toLowerCase()

    const user = await User.findOne({ email })
    const hashedPassword = user.password

    if (await bcrypt.compare(password, hashedPassword)) {
      const payload = user.toJSON()

      const token = await jwt.sign(payload, KEY_BERKELEYTIME)
      return res.json({
        success: true,
        jwt: token,
      })
    }
    return res.status(400).json({ success: false, message: "Login failed" })
  }

  register: ExpressMiddleware<RegisterRequest, RegisterResponse> = async (
    req,
    res
  ) => {
    let { email, name, password } = req.body
    email = email.toLowerCase()

    await mongoose.connection.transaction(async (session) => {
      const user = await User.findOne({ email }).session(session)
      if (user) {
        await User.deleteOne({ _id: user.id }).session(session)
      }
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)
      const newUser = new User({
        email,
        name,
        password: hash,
      })
      const activationToken = await jwt.sign(
        { id: newUser.id },
        KEY_BERKELEYTIME,
        {
          expiresIn: EXPIRE_TIME_ACTIVATION_EMAIL / 1000,
        }
      )
      newUser.activation_token = activationToken
      await sendActivationEmail({
        email: newUser.email,
        activationToken,
      })
      const savedUser = await newUser.save({ session })
      return res.json({ user: savedUser })
    })
  }

  activate: ExpressMiddleware<{}, {}> = async (req, res) => {
    let decoded
    const { token } = req.params
    try {
      decoded = await jwt.verify(token, KEY_BERKELEYTIME)
    } catch (err) {
      return res.status(400).json({
        activation:
          "Activation token has expired! Register your account with the same email address.",
      })
    }
    const user = await User.findById(decoded.id)
    user.activated = true
    req.user = await user.save()
    return res.json({
      user: req.user,
    })
  }

  exists: ExpressMiddleware<{}, {}> = async (req, res) => {
    let { email } = req.params
    email = email.toLowerCase()

    const user = await User.findOne({ email })
    if (user) {
      res.json({
        success: true,
        msg: `User ${email} exists`,
      })
    }
    return res.json({
      success: false,
      msg: `User with the given email address of ${email} does not exist`,
    })
  }

  delete: ExpressMiddleware<{}, {}> = async (req, res) => {
    const { google_id } = req.user
    await User.deleteOne({ google_id })
    res.json({ success: true })
  }

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
    })
  }

  googleCallback: ExpressMiddleware<{}, {}> = async (req, res) => {
    const { google_id } = req.user
    const user = await User.findOne({ google_id })
    const userToken = await jwt.sign(user.toJSON(), KEY_BERKELEYTIME)
    user.jwt = userToken
    await user.save()
    return res.json({ success: true, jwt: userToken })
  }
})()
