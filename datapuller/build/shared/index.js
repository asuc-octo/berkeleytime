"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setup;
const tslog_1 = require("tslog");
const config_1 = require("./config");
function setup() {
    (0, config_1.loadConfig)();
    const log = new tslog_1.Logger({
        type: 'pretty',
        prettyLogTimeZone: 'local',
    });
    return { log };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2hhcmVkL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0Esd0JBU0M7QUFaRCxpQ0FBK0I7QUFDL0IscUNBQXNDO0FBRXRDLFNBQXdCLEtBQUs7SUFDM0IsSUFBQSxtQkFBVSxHQUFFLENBQUM7SUFFYixNQUFNLEdBQUcsR0FBRyxJQUFJLGNBQU0sQ0FBQztRQUNyQixJQUFJLEVBQUUsUUFBUTtRQUNkLGlCQUFpQixFQUFFLE9BQU87S0FDM0IsQ0FBQyxDQUFDO0lBRUgsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLENBQUMifQ==