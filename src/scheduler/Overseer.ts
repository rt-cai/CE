import {SchedRoom, SchedSection, TimeSlot} from "./IScheduler";
import {DistCalc, Sorter} from "../controller/Tools";
import {IAssign} from "./IAssign";
import {writeJsonSync} from "fs-extra";
import Log from "../Util";

export default class Overseer {
    private Sections: SchedSection[];
    private Rooms: SchedRoom[];
    // private Assigner: IAssign;
    public constructor(sections: SchedSection[], rooms: SchedRoom[]) {
        const start = Date.now();

        // sections based on size
        let ks = "total";
        for (let s of sections) {
            let ss: any = s;
            ss[ks] = this.getClassSize(s);
        }
        let sorter: Sorter = new Sorter();
        sorter.quickSort(sections, 0, sections.length - 1, [ks]);
        for (let s of sections) {
            let ss: any = s;
            delete ss[ks];              // remove field "total"
        }
        Log.p(`sections sort; ${Date.now() - start}`);

        // rooms based on dist to biggest
        let max = 0, mx = null, my = null;
        for (let r of rooms) {          // get biggest room
            if (r.rooms_seats > max) {
                max = r.rooms_seats;
                mx = r.rooms_lon;
                my = r.rooms_lat;
            }
        }
        const dist = "dist";
        for (let r of rooms) {          // calc dist to biggest room
            let x = r.rooms_lon - mx;
            let y = r.rooms_lat - my;
            let rr: any = r;
            rr[dist] = x * x + y * y;   // square dist is fine
        }
        Log.p(`dist calc; ${Date.now() - start}`);
        sorter.quickSort(rooms, 0, rooms.length - 1, [dist]);   // sort based on dist
        for (let r of rooms) {          // calc dist to biggest room
            let rr: any = r;
            delete rr[dist]; // clean up
        }
        Log.p(`dist sort; ${Date.now() - start}`);

        this.Sections = [...sections.reverse()];
        this.Rooms = [...rooms.reverse()];
        // this.Assigner = assigner;

        // this.run();
    }

    // private run() {
    //     let distCalc = new DistCalc();
    //     let sorter = new Sorter();
    //
    //     let getX = (d: any) => {
    //         return d.rooms_lon;
    //     };
    //     let getY = (d: any) => {
    //         return d.rooms_lat;
    //     };
    //
    //     let bank = Array(this.Rooms.length);
    //     let byDist = distCalc.normalize(this.Rooms, getX, getY);
    //     sorter.quickSort(byDist, 0,  byDist.length - 1, ["l"]);
    //
    //     let sum = 0; // needed seats
    //     for (let s of this.Sections) {
    //         sum += this.getClassSize(s);
    //     }
    //
    //     for (let r of byDist) {
    //         bank.push(this.Rooms[r.i]);
    //         sum -= this.Rooms[r.i].rooms_seats * this.getTimeSlots().length;
    //         if (sum < 0) {
    //             break;
    //         }
    //     }
    //
    //     let prevScore = 0;
    //     let gx = () => {
    //
    //     };
    //     let gy = () => {
    //
    //     };
    //     while (true) {
    //         let attempt = this.Assigner.assign([...bank], this.getSections(), this.getTimeSlots());
    //         // let d = distCalc.getMaxDist(attempt);
    //     }
    // }

    public getClassSize(s: SchedSection) {
        return s.courses_fail + s.courses_pass + s.courses_audit;
    }

    public getSections(): SchedSection[] {
        return [...this.Sections];
    }

    public getRooms(): SchedRoom[] {
        return [...this.Rooms];
    }

    public getTimeSlots(): TimeSlot[] {
        return [
            "MWF 0800-0900" , "MWF 0900-1000" , "MWF 1000-1100" ,
            "MWF 1100-1200" , "MWF 1200-1300" , "MWF 1300-1400" ,
            "MWF 1400-1500" , "MWF 1500-1600" , "MWF 1600-1700" ,
            "TR  0800-0930" , "TR  0930-1100" , "TR  1100-1230" ,
            "TR  1230-1400" , "TR  1400-1530" , "TR  1530-1700"
        ];
    }


}
