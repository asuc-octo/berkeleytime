"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const dotenv_1 = __importDefault(require("dotenv"));
// Safely get the environment variable in the process
const env = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing: process.env['${name}'].`);
    }
    return value;
};
function loadConfig() {
    dotenv_1.default.config();
    return {
        isDev: env('NODE_ENV') === 'development',
        mongoDB: {
            uri: env('MONGODB_URI'),
        },
        sis: {
            CLASS_APP_ID: env('SIS_CLASS_APP_ID'),
            CLASS_APP_KEY: env('SIS_CLASS_APP_KEY'),
            COURSE_APP_ID: env('SIS_COURSE_APP_ID'),
            COURSE_APP_KEY: env('SIS_COURSE_APP_KEY'),
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NoYXJlZC9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUEwQkEsZ0NBZUM7QUF6Q0Qsb0RBQTRCO0FBRTVCLHFEQUFxRDtBQUNyRCxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQVksRUFBVSxFQUFFO0lBQ25DLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFaEMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsSUFBSSxLQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDLENBQUM7QUFlRixTQUFnQixVQUFVO0lBQ3hCLGdCQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7SUFFaEIsT0FBTztRQUNMLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssYUFBYTtRQUN4QyxPQUFPLEVBQUU7WUFDUCxHQUFHLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQztTQUN4QjtRQUNELEdBQUcsRUFBRTtZQUNILFlBQVksRUFBRSxHQUFHLENBQUMsa0JBQWtCLENBQUM7WUFDckMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztZQUN2QyxhQUFhLEVBQUUsR0FBRyxDQUFDLG1CQUFtQixDQUFDO1lBQ3ZDLGNBQWMsRUFBRSxHQUFHLENBQUMsb0JBQW9CLENBQUM7U0FDMUM7S0FDRixDQUFDO0FBQ0osQ0FBQyJ9