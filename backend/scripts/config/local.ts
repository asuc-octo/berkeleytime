import dotenv from 'dotenv';

dotenv.config();

export default {
    dbUri: process.env.LOCAL_DB_URI,
}