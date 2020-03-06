"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Assign_1 = require("./Assign");
const Overseer_1 = require("./Overseer");
class Scheduler {
    schedule(sections, rooms) {
        let a = new Assign_1.default();
        let o = new Overseer_1.default(sections, rooms);
        let assigned = a.assign(o.getRooms(), o.getSections(), o.getTimeSlots());
        return assigned;
    }
}
exports.default = Scheduler;
//# sourceMappingURL=Scheduler.js.map