import {IScheduler, SchedRoom, SchedSection, TimeSlot} from "./IScheduler";
import Assign from "./Assign";
import Overseer from "./Overseer";

export default class Scheduler implements IScheduler {

    public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
        let a = new Assign();
        let o = new Overseer(sections, rooms);
        let assigned = a.assign(o.getRooms(), o.getSections(), o.getTimeSlots());
        return assigned;
        // return [];
    }
}
