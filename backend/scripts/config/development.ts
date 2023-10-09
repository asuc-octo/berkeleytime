import dotenv from 'dotenv';

dotenv.config();

export default {
    dbUri: process.env.DEV_DB_URI,
    apiBase: process.env.DEV_API_BASE,
}