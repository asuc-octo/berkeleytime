"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const berkeleytime_mongo_models_1 = __importDefault(require("berkeleytime-mongo-models"));
const shared_1 = __importDefault(require("./shared"));
const SIS_COURSE_URL = 'https://gateway.api.berkeley.edu/sis/v4/courses';
async function main() {
    const { log } = (0, shared_1.default)();
    log.info(SIS_COURSE_URL);
    log.info(berkeleytime_mongo_models_1.default.SemesterModel);
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY291cnNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvdXJzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDBGQUErQztBQUMvQyxzREFBNkI7QUFFN0IsTUFBTSxjQUFjLEdBQUcsaURBQWlELENBQUM7QUFFekUsS0FBSyxVQUFVLElBQUk7SUFDakIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUEsZ0JBQUssR0FBRSxDQUFDO0lBRXhCLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDekIsR0FBRyxDQUFDLElBQUksQ0FBQyxtQ0FBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9