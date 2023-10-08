import dotenv from 'dotenv';

dotenv.config();

export default {
    dev_dbUri: process.env.LOCAL_DB_URI,
}