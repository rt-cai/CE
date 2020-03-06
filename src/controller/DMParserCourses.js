"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const IInsightFacade_1 = require("./IInsightFacade");
class ParserCourses {
    constructor() {
        this.kind = IInsightFacade_1.InsightDatasetKind.Courses;
        this.fieldMap = {
            dept: "Subject",
            id: "Course",
            instructor: "Professor",
            title: "Title",
            uuid: "id",
            pass: "Pass",
            fail: "Fail",
            audit: "Audit",
            avg: "Avg",
            year: "Year",
        };
    }
    cullInvalid(entry) {
        let out = new Array(Object.keys(this.fieldMap).length);
        let i = 0;
        if (entry.Section === "overall") {
            entry.Year = 1900;
        }
        for (let k of Object.keys(this.fieldMap)) {
            let kf = this.fieldMap[k];
            let val = entry[kf];
            if (val === undefined) {
                return false;
            }
            out[i] = entry[kf];
            i++;
        }
        return out;
    }
    parse(file) {
        return JSON.parse(file.toString()).result;
    }
    parseEntries(files) {
        let acceptedEntries = [];
        Util_1.default.p(`parsing ${files.length} files...`, "b");
        let count = 0;
        let i = -1;
        for (let f of files) {
            i++;
            let entries;
            try {
                entries = this.parse(f.file);
            }
            catch (e) {
                Util_1.default.p(`cannot read file ${i} of ${files.length}: ${f.name}`, "Y");
                continue;
            }
            if (entries.length === 0) {
                count++;
            }
            for (let entry of entries) {
                count++;
                let parsed = this.cullInvalid(entry);
                if (parsed) {
                    acceptedEntries.push(parsed);
                }
            }
        }
        Util_1.default.p(`${acceptedEntries.length} valid entries of ${count}`, "b");
        return Promise.resolve(acceptedEntries);
    }
    compileEntry(fieldID, entry) {
        return fieldID === 9 ? parseInt(entry, 10) : fieldID === 4 ? `${entry}` : entry;
    }
}
exports.ParserCourses = ParserCourses;
//# sourceMappingURL=DMParserCourses.js.map