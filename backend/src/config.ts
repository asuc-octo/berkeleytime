export const EXPIRE_TIME_ACTIVATION_EMAIL: number =
  parseInt(process.env.EXPIRE_TIME_ACTIVATION_EMAIL) || 3600000; // milliseconds
export const EXPIRE_TIME_REDIS_KEY: number =
  parseInt(process.env.EXPIRE_TIME_REDIS_KEY) || 60; // seconds
export const GCLOUD_SERVICE_ACCOUNT_EMAIL =
  process.env.GCLOUD_SERVICE_ACCOUNT_EMAIL;
export const GCLOUD_SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.GCLOUD_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
export const GCLOUD_BUCKET = "berkeleytime";
export const GCLOUD_PATH_CAL_ANSWERS_GRADE_DUMPS: string =
  "dumps_CalAnswers_grades";
export const GCLOUD_PATH_SIS_COURSE_DUMPS: string = "dumps_sis_course";
export const GCLOUD_PROJECT_ID = "berkeleytime-218606";
export const GCLOUD_REGION = "us-west2";
export const KEY_BERKELEYTIME = process.env.KEY_BERKELEYTIME || "asdf";
export const KEY_GOOGLE_CLIENT_ID =
  process.env.KEY_GOOGLE_CLIENT_ID ||
  "634751923298-s21r1ph48c2bvcser7thbsd368udknqt.apps.googleusercontent.com";
export const KEY_GOOGLE_CLIENT_SECRET = process.env.KEY_GOOGLE_CLIENT_SECRET;
export const KEY_SENDGRID = process.env.KEY_SENDGRID;
export const PORT_EXPRESS: number = parseInt(process.env.PORT_EXPRESS) || 5000;
export const PRIVILEGED_MODE =
  process.env.NODE_ENV == "privileged" ? true : false;
export const SENDGRID_PASSWORD = process.env.SENDGRID_PASSWORD;
export const SENDGRID_USERNAME = process.env.SENDGRID_USERNAME;
export const SIS_CLASS_APP_ID: string = process.env.SIS_CLASS_APP_ID;
export const SIS_CLASS_APP_KEY: string = process.env.SIS_CLASS_APP_KEY;
export const SIS_COURSE_APP_ID: string = process.env.SIS_COURSE_APP_ID;
export const SIS_COURSE_APP_KEY: string = process.env.SIS_COURSE_APP_KEY;
export const URL_DOMAIN = process.env.URL_DOMAIN || "http://localhost:8080";
export const URL_MDB = process.env.URL_MDB || "mongodb://mongodb/bt";
export const URL_REDIS = process.env.URL_REDIS || "redis://redis";
export const URL_SIS_COURSE_API = "https://apis.berkeley.edu/sis/v3/courses";
export const URL_SIS_CLASS_API = "https://apis.berkeley.edu/sis/v1/classes";
export const URL_SIS_CLASS_SECTIONS_API =
  "https://apis.berkeley.edu/sis/v1/classes/sections";
export const URL_VERIFY_GOOGLE_TOKEN =
  "https://www.googleapis.com/oauth2/v3/tokeninfo";
