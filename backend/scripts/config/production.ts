import dotenv from 'dotenv';

dotenv.config();

export default {
    prod_dbUri: process.env.PROD_DB_URI,
};