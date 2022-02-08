export const EXPIRE_TIME_ACTIVATION_EMAIL: number =
  parseInt(process.env.EXPIRE_TIME_ACTIVATION_EMAIL) || 3600000 // milliseconds
export const EXPIRE_TIME_REDIS_KEY: number =
  parseInt(process.env.EXPIRE_TIME_REDIS_KEY) || 60 // seconds
export const GCLOUD_SERVICE_ACCOUNT_EMAIL =
  process.env.GCLOUD_SERVICE_ACCOUNT_EMAIL
export const GCLOUD_SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.GCLOUD_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n")
export const GCLOUD_BUCKET = "berkeleytime-218606"
export const GCLOUD_PATH_SIS_CLASS_DUMPS: string = "dumps_sis_class"
export const GCLOUD_PATH_SIS_COURSE_DUMPS: string = "dumps_sis_course"
export const GCLOUD_PROJECT_ID = "berkeleytime-218606"
export const GCLOUD_REGION = "us-west2"
export const KEY_APOLLO = process.env.KEY_APOLLO
export const KEY_BERKELEYTIME = process.env.KEY_BERKELEYTIME
export const KEY_SENDGRID = process.env.KEY_SENDGRID
export const PORT_EXPRESS: number = parseInt(process.env.PORT_EXPRESS) || 5000
export const SENDGRID_PASSWORD = process.env.SENDGRID_PASSWORD
export const SENDGRID_USERNAME = process.env.SENDGRID_USERNAME
export const SIS_CLASS_APP_ID: string = process.env.SIS_CLASS_APP_ID
export const SIS_CLASS_APP_KEY: string = process.env.SIS_CLASS_APP_KEY
export const SIS_COURSE_APP_ID: string = process.env.SIS_COURSE_APP_ID
export const SIS_COURSE_APP_KEY: string = process.env.SIS_COURSE_APP_KEY
export const URL_DOMAIN = process.env.URL_DOMAIN || "http://localhost:3000"
export const URL_MDB = process.env.URL_MDB || ""
export const URL_REDIS = process.env.URL_REDIS
export const URL_SIS_COURSE_API = "https://apis.berkeley.edu/sis/v3/courses"
