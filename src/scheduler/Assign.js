"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
class Assign {
    constructor() {
        this.assignedCourses = [];
        this.CUTOFF = 30;
    }
    assign(rooms, sections, timeslots) {
        let assigned = [];
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
        Util_1.default.p(`assign ${Date.now() - this.start}`);
        return assigned;
    }
    assignRoom(room, sections, timeslot) {
        let result = [];
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
    binarySearch(array, target, start, end) {
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
                middle--;
                enrollment = array[middle].courses_fail + array[middle].courses_pass + array[middle].courses_audit;
                if (enrollment > target) {
                    return middle + 1;
                }
            }
        }
        else if (target > enrollment) {
            let b = array[middle - 1].courses_fail + array[middle - 1].courses_pass + array[middle - 1].courses_audit;
            if (b <= target) {
                return this.binarySearch(array, target, start, middle - 1);
            }
            else {
                return middle;
            }
        }
        else {
            let a = array[middle + 1].courses_fail + array[middle + 1].courses_pass + array[middle + 1].courses_audit;
            if (target <= a) {
                return this.binarySearch(array, target, middle + 1, end);
            }
            else {
                return middle + 1;
            }
        }
    }
    getCourseID(sec) {
        return `${sec.courses_dept} ${sec.courses_id}`;
    }
    assignable(sec, time) {
        return !this.assignedCourses[time].includes(this.getCourseID(sec));
    }
}
exports.default = Assign;
//# sourceMappingURL=Assign.js.map