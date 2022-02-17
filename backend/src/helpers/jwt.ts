import jwt from "jsonwebtoken";
import { promisify } from "util";

jwt.verify = promisify(jwt.verify);
jwt.sign = promisify(jwt.sign);

export default jwt;
