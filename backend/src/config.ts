export const EXPIRE_TIME_ACTIVATION_EMAIL: number =
  parseInt(process.env.EXPIRE_TIME_ACTIVATION_EMAIL) || 3600000 // milliseconds
export const EXPIRE_TIME_REDIS_KEY: number =
  parseInt(process.env.EXPIRE_TIME_REDIS_KEY) || 60 // seconds
export const KEY_BERKELEYTIME = process.env.KEY_BERKELEYTIME
export const KEY_SENDGRID = process.env.KEY_SENDGRID
export const SENDGRID_PASSWORD = process.env.SENDGRID_PASSWORD
export const SENDGRID_USERNAME = process.env.SENDGRID_USERNAME
export const PORT_EXPRESS: number = parseInt(process.env.PORT_EXPRESS) || 5000
export const URL_DOMAIN = process.env.URL_DOMAIN || "http://localhost:3000"
export const URL_MDB = process.env.URL_MDB || ""
export const URL_REDIS = process.env.URL_REDIS
