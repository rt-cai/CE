"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IInsightFacade_1 = require("./IInsightFacade");
const QueryValidate_1 = require("./QueryValidate");
const Transformer_1 = require("./Transformer");
const Options_1 = require("./Options");
const Util_1 = require("../Util");
class Queryer {
    constructor(dataMgr) {
        this.dataset = [];
        this.SEP = "dfghjkjhg#$%^&*()(*&^%$";
        this.dMgr = dataMgr;
    }
    doJob(query) {
        return new Promise((resolve, reject) => {
            this.q = new QueryValidate_1.QueryValidate(this.dMgr);
            this.q.isQueryValid(query).then((iqv) => {
                return iqv;
            }).then((iqv) => {
                if (iqv) {
                    Util_1.default.p(`valid, beginning search...`, "b");
                    this.dataset = this.q.getDataset();
                    const id = this.dataset[0];
                    this.dMgr.loadDataset(id).then((val) => {
                        const datas = val;
                        this.sections = datas.entries;
                        Util_1.default.p(`finding entries...`, "B");
                        this.record = this.findSections(query.WHERE, this.sections);
                        this.t = new Transformer_1.Transformer(this);
                        Util_1.default.p(`applying transformations...`, "B");
                        let trans = this.t.transformations(query.TRANSFORMATIONS);
                        let k = this.t.getKeys();
                        let r = this.t.getRules();
                        this.o = new Options_1.Options(this, trans, k, r, this.t);
                        Util_1.default.p(`compiling results...`, "B");
                        let response = this.o.conformer(query.OPTIONS);
                        if (!response) {
                            reject(new IInsightFacade_1.ResultTooLargeError());
                        }
                        else {
                            resolve(response);
                            Util_1.default.p(`search complete`, "b");
                        }
                    }).catch((err) => {
                        return reject(new IInsightFacade_1.InsightError("failed in Q " + err));
                    });
                }
                else {
                    reject(new IInsightFacade_1.InsightError("Invalid Query Structure"));
                    return;
                }
            });
        });
    }
    findSections(where, sections) {
        let filterType = Object.keys(where)[0];
        if (filterType === undefined) {
            return new Array(sections.length).fill(true);
        }
        let value = where[filterType];
        let innerType = Object.keys(where[filterType])[0];
        let innerValue = where[filterType][innerType];
        let record = [];
        if (this.isObject(innerValue)) {
            if (filterType === "NOT") {
                record = this.findSections(value, sections);
                for (let m = 0; m < record.length; m++) {
                    record[m] = !record[m];
                }
            }
            else {
                record = this.logOp(record, sections, filterType, value);
            }
        }
        else {
            let fieldIndex = this.getIndex(innerType);
            record = new Array(sections.length);
            if (typeof innerValue === "number") {
                let comparator;
                switch (filterType) {
                    case "LT":
                        comparator = (a, b) => a < b;
                        break;
                    case "GT":
                        comparator = (a, b) => a > b;
                        break;
                    case "EQ":
                        comparator = (a, b) => a === b;
                        break;
                }
                record = this.findM(innerValue, sections, fieldIndex, comparator);
            }
            else {
                record = this.findS(innerValue, sections, fieldIndex);
            }
        }
        return record;
    }
    logOp(record, sections, filterType, value) {
        let length = sections.length;
        record = new Array(length);
        if (filterType === "AND") {
            for (let i = 0; i < length; i++) {
                record[i] = true;
            }
            for (let filter of value) {
                let part = this.findSections(filter, sections);
                for (let i = 0; i < record.length; i++) {
                    record[i] = record[i] && part[i];
                }
            }
        }
        else {
            for (let filter of value) {
                let part = this.findSections(filter, sections);
                for (let i = 0; i < record.length; i++) {
                    record[i] = part[i] || record[i];
                }
            }
        }
        return record;
    }
    findM(target, sections, field, c) {
        let part = new Array(sections.length);
        let i = 0;
        for (let sect of sections) {
            if (c(sect[field], target)) {
                part[i] = true;
            }
            i++;
        }
        return part;
    }
    processWild(target) {
        target = target.toString();
        let ret = { isWild: false, front: false, back: false, target };
        if (target.indexOf("*") !== -1) {
            if (target.startsWith("*")) {
                ret.isWild = true;
                ret.front = true;
                ret.target = ret.target.substring(1);
            }
            if (target.endsWith("*")) {
                ret.isWild = true;
                ret.back = true;
                ret.target = ret.target.substring(0, ret.target.length - 1);
            }
        }
        return ret;
    }
    findS(rawTarget, sections, field) {
        let part = new Array(sections.length);
        let targetData = this.processWild(rawTarget);
        let i = 0;
        for (let sect of sections) {
            if (this.stringEquals(targetData, sect[field])) {
                part[i] = true;
            }
            i++;
        }
        return part;
    }
    stringEquals(target, ref) {
        if (target.isWild) {
            if (target.front && target.back) {
                return ref.indexOf(target.target) !== -1;
            }
            else if (target.front) {
                return ref.endsWith(target.target);
            }
            else {
                return ref.startsWith(target.target);
            }
        }
        else {
            return ref === target.target;
        }
    }
    isObject(t) {
        return (typeof t === "object" && t !== null);
    }
    getIndex(field) {
        let f = field.substring(field.indexOf("_") + 1, field.length);
        if (this.dMgr.getDatasetKind(this.dataset[0]) === IInsightFacade_1.InsightDatasetKind.Courses) {
            return this.getIndexC(f);
        }
        return this.getIndexR(f);
    }
    getIndexC(field) {
        let fields = ["dept", "id", "instructor", "title", "uuid", "pass", "fail", "audit", "avg", "year"];
        return fields.findIndex((a) => a === field);
    }
    getIndexR(field) {
        let fields = ["fullname", "shortname", "number", "name",
            "address", "lat", "lon", "seats", "type", "furniture", "href"];
        return fields.findIndex((a) => a === field);
    }
}
exports.default = Queryer;
//# sourceMappingURL=Queryer.js.map