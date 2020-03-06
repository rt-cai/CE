import {SchedRoom, SchedSection, TimeSlot} from "./IScheduler";
export interface IAssign {
    /**
     *  use your quicksort.
     *  rooms: new added rooms, from more seats to less seats
     *  sections: left sections, from more enrollments to less enrollments
     *  timeslots: 15 timeslots
     */
    assign(rooms: SchedRoom[], sections: SchedSection[], timeslots: TimeSlot[]):
        Array<[SchedRoom, SchedSection, TimeSlot]>;
}

