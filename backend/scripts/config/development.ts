import dotenv from 'dotenv';

dotenv.config();

export default {
    dev_dbUri: process.env.DEV_DB_URI,
}