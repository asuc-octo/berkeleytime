import { KEY_SENDGRID } from "#src/config"
import activation from "#src/templates/activation"

import sendgrid from "@sendgrid/mail"

sendgrid.setApiKey(KEY_SENDGRID)

export default async ({ email, activationToken }) => {
  const msg = {
    to: email,
    from: "no-reply@berkeleytime.com",
    subject: "Activate your account at Berkeleytime.com",
    html: activation(activationToken),
  }

  try {
    await sendgrid.send(msg)
  } catch (err) {
    console.error(err.toString())
  }
}
