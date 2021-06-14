import { EXPIRE_TIME_ACTIVATION_EMAIL, URL_DOMAIN } from "#src/config"

export default (token: string) => {
  return `
    <html>
      <body>
        <div style="text-align: center;">
          <p>You have ${EXPIRE_TIME_ACTIVATION_EMAIL / 1000} seconds to use this link before it expires. </p>
          <div>
            <a href="${URL_DOMAIN}/api/users/activate/${token}">Activation link</a>
          </div>
        </div>
      </body>
    </html>
  `
}
