"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tools_1 = require("../controller/Tools");
const Util_1 = require("../Util");
class Overseer {
    constructor(sections, rooms) {
        const start = Date.now();
        let ks = "total";
        for (let s of sections) {
            let ss = s;
            ss[ks] = this.getClassSize(s);
        }
        let sorter = new Tools_1.Sorter();
        sorter.quickSort(sections, 0, sections.length - 1, [ks]);
        for (let s of sections) {
            let ss = s;
            delete ss[ks];
        }
        Util_1.default.p(`sections sort; ${Date.now() - start}`);
        let max = 0, mx = null, my = null;
        for (let r of rooms) {
            if (r.rooms_seats > max) {
                max = r.rooms_seats;
                mx = r.rooms_lon;
                my = r.rooms_lat;
            }
        }
        const dist = "dist";
        for (let r of rooms) {
            let x = r.rooms_lon - mx;
            let y = r.rooms_lat - my;
            let rr = r;
            rr[dist] = x * x + y * y;
        }
        Util_1.default.p(`dist calc; ${Date.now() - start}`);
        sorter.quickSort(rooms, 0, rooms.length - 1, [dist]);
        for (let r of rooms) {
            let rr = r;
            delete rr[dist];
        }
        Util_1.default.p(`dist sort; ${Date.now() - start}`);
        this.Sections = [...sections.reverse()];
        this.Rooms = [...rooms.reverse()];
    }
    getClassSize(s) {
        return s.courses_fail + s.courses_pass + s.courses_audit;
    }
    getSections() {
        return [...this.Sections];
    }
    getRooms() {
        return [...this.Rooms];
    }
    getTimeSlots() {
        return [
            "MWF 0800-0900", "MWF 0900-1000", "MWF 1000-1100",
            "MWF 1100-1200", "MWF 1200-1300", "MWF 1300-1400",
            "MWF 1400-1500", "MWF 1500-1600", "MWF 1600-1700",
            "TR  0800-0930", "TR  0930-1100", "TR  1100-1230",
            "TR  1230-1400", "TR  1400-1530", "TR  1530-1700"
        ];
    }
}
exports.default = Overseer;
//# sourceMappingURL=Overseer.js.map