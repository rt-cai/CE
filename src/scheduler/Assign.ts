import {SchedRoom, SchedSection, TimeSlot} from "./IScheduler";
import {IAssign} from "./IAssign";
import Log from "../Util";

export default class Assign implements IAssign {

    private assignedCourses: string[][] = [];
    private readonly CUTOFF = 30;
    private start: number;

    public assign(rooms: SchedRoom[], sections: SchedSection[], timeslots: TimeSlot[]):
        Array<[SchedRoom, SchedSection, TimeSlot]> {

        let assigned: Array<[SchedRoom, SchedSection, TimeSlot]> = [];
        let i = 0;
        while (i < 15) {
            this.assignedCourses.push([]);
            i++;
        }

        this.start = Date.now();
        for (let r of rooms) {
            let result = this.assignRoom(r, sections, timeslots);
            assigned = [...assigned, ...result];

            if (Date.now() - this.start > this.CUTOFF) {
                break;
            }
        }

        Log.p(`assign ${Date.now() - this.start}`);
        return assigned;
    }

    private assignRoom(room: SchedRoom, sections: SchedSection[], timeslot: TimeSlot[]):
        Array<[SchedRoom, SchedSection, TimeSlot]> {
        let result: Array<[SchedRoom, SchedSection, TimeSlot]> = [];
        let seats = room.rooms_seats;
        let sectionsLength = sections.length - 1;
        if (sectionsLength === -1) {
            return result;
        }
        let firstSection = this.binarySearch(sections, seats, 0, sectionsLength);
        if (firstSection === false) {
            return result;
        }
        let i = firstSection;
        let t = 0;
        while (t < 15 && Date.now() - this.start < this.CUTOFF) {
            if (i > sectionsLength) {
                break;
            }
            if (this.assignable(sections[i], t)) {
                result.push([room, sections[i], timeslot[t]]);
                this.assignedCourses[t].push(this.getCourseID(sections[i]));
                sections.splice(i, 1);
                i--;
                sectionsLength--;
                t++;
            }
            i++;
        }
        return result;
    }

    private binarySearch(array: SchedSection[], target: number, start: number, end: number): false|number {
        let middle = Math.round((start + end) / 2);
        let enrollment = array[middle].courses_fail + array[middle].courses_pass + array[middle].courses_audit;
        if (start === end) {
            if (enrollment > target) {
                return false;
            }
            return start;
        }
        if (target === enrollment) {
            while (middle > 0) {
                middle --;
                enrollment = array[middle].courses_fail + array[middle].courses_pass + array[middle].courses_audit;
                if (enrollment > target) {
                    return middle + 1;
                }
            }
        } else if (target > enrollment) {
            let b = array[middle - 1].courses_fail + array[middle - 1].courses_pass + array[middle - 1].courses_audit;
            if (b <= target) {
                return this.binarySearch(array, target, start, middle - 1);
            } else {
                return middle;
            }
        } else {
            let a = array[middle + 1].courses_fail + array[middle + 1].courses_pass + array[middle + 1].courses_audit;
            if (target <= a) {
                return this.binarySearch(array, target, middle + 1, end);
            } else {
                return middle + 1;
            }
        }
    }

    private getCourseID(sec: SchedSection): string {
        return `${sec.courses_dept} ${sec.courses_id}`;
    }

    private assignable(sec: SchedSection, time: number): boolean {
        return !this.assignedCourses[time].includes(this.getCourseID(sec));
    }
}
