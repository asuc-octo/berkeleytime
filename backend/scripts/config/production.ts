import dotenv from 'dotenv';

dotenv.config();

export default {
    dbUri: process.env.PROD_DB_URI,
    apiBase: process.env.PROD_API_BASE,
};