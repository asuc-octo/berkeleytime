import mongoose, { Connection } from "mongoose";
import config from 'config';

import { DB_CONNECTION_STATES } from "../../constants";

export class Db {
    /**
     * Contain all methods related to database and MongoDB
     * interactions.
     */
    private _connection: Connection;

    /**
     * Instance of this database.
     */
    private _instance: any;

    /**
     * @returns { Connection } Connection to the database.
     */
    get connection(): Connection {
        return this._connection;
    }

    /**
     * @returns { any } Instance of this initialized database.
     */
    get instance(): any {
        return this._instance;
    }

    /**
     * Connects to database instance on MongoDB Atlas.
     */
    public async connect(): Promise<void> {
        for (const state of DB_CONNECTION_STATES) {
            mongoose.connection.on(state, () => {
                console.log(`MongoDB: ${state}`);
            });
        }
        try {
            if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
                this._instance = await mongoose.connect(
                    config.get('dbUri'),
                    {
                        autoIndex: true,
                        serverSelectionTimeoutMS: 5000,
                    }
                );
                this._connection = this._instance.connection;
            }
        } catch (error) {
            console.log(`Error connecting to DB: ${error}`)
        }
    }
}