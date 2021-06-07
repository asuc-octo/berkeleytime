import dotenv from "dotenv"
import path from "path"

const envFile = `.env.${process.env.NODE_ENV || "dev"}`

dotenv.config({
    path: path.resolve(process.cwd(), envFile)
})