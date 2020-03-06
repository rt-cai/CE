"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decimal_js_1 = require("decimal.js");
class Transformer {
    constructor(q) {
        this.queryer = q;
        this.keys = [];
        this.rules = [];
    }
    getKeys() {
        return [...this.keys];
    }
    getRules() {
        return [...this.rules];
    }
    getIndex(s) {
        return this.keys.findIndex((a) => a === s);
    }
    getIndexR(s) {
        return this.rules.findIndex((a) => a === s);
    }
    transformations(trans) {
        let result = [];
        if (trans === undefined) {
            return result;
        }
        let groups = this.findGroups(trans.GROUP);
        for (let key of trans.GROUP) {
            this.keys.push(key);
        }
        if (trans.APPLY.length === 0) {
            return groups;
        }
        result = this.applyTrans(groups, trans.APPLY);
        return result;
    }
    findGroups(keys) {
        let groups = [];
        let found = new Map();
        let i = 0;
        for (let r of this.queryer.record) {
            if (r) {
                let names = [];
                for (let k of keys) {
                    names.push(this.queryer.sections[i][this.queryer.getIndex(k)]);
                }
                let name = names.join(this.queryer.SEP);
                if (found.has(name)) {
                    groups[found.get(name)][name].push(this.queryer.sections[i]);
                }
                else {
                    let newGroup = {};
                    newGroup[`${name}`] = [names, this.queryer.sections[i]];
                    found.set(name, groups.length);
                    groups.push(newGroup);
                }
            }
            i++;
        }
        return groups;
    }
    applyTrans(groups, rule) {
        let result = new Array(groups.length);
        for (let i = 0; i < result.length; i++) {
            result[i] = {};
        }
        for (let r of rule) {
            let applykey = Object.keys(r)[0];
            this.rules.push(applykey);
            let applyrule = Object.values(r)[0];
            let applytoken = Object.keys(applyrule)[0];
            let key = Object.values(applyrule)[0];
            let i = 0;
            for (let group of groups) {
                let sections = Object.values(group)[0];
                let ori = sections.reverse().pop();
                let ans;
                if (applytoken === "MAX") {
                    ans = this.maxMin(sections, key, 1);
                }
                else if (applytoken === "MIN") {
                    ans = this.maxMin(sections, key, -1);
                }
                else if (applytoken === "SUM") {
                    ans = this.sum(sections, key);
                }
                else if (applytoken === "COUNT") {
                    ans = this.count(sections, key);
                }
                else {
                    ans = this.avg(sections, key);
                }
                sections.push(ori);
                sections.reverse();
                if (result[i][Object.keys(group)[0]] === undefined) {
                    result[i][Object.keys(group)[0]] = [ori];
                }
                result[i][Object.keys(group)[0]].push(ans);
                i++;
            }
        }
        return result;
    }
    maxMin(sections, key, marker) {
        let index = this.queryer.getIndex(key);
        if (Array.isArray(sections)) {
            let temp = marker * sections[0][index];
            for (let section of sections) {
                if (marker * section[index] > temp) {
                    temp = marker * section[index];
                }
            }
            return marker * temp;
        }
        return -1;
    }
    sum(sections, key) {
        let sum = 0;
        let index = this.queryer.getIndex(key);
        if (Array.isArray(sections)) {
            for (let section of sections) {
                sum = sum + section[index];
            }
        }
        return Number(sum.toFixed(2));
    }
    count(sections, key) {
        let count = 0;
        let index = this.queryer.getIndex(key);
        let uniques = [];
        if (Array.isArray(sections)) {
            for (let section of sections) {
                if (!uniques.includes(section[index])) {
                    uniques.push(section[index]);
                    count++;
                }
            }
        }
        return count;
    }
    avg(sections, key) {
        let sum = new decimal_js_1.default(0);
        let index = this.queryer.getIndex(key);
        if (Array.isArray(sections)) {
            for (let section of sections) {
                sum = decimal_js_1.default.add(sum, section[index]);
            }
        }
        let avg = sum.toNumber() / sections.length;
        return Number(avg.toFixed(2));
    }
}
exports.Transformer = Transformer;
//# sourceMappingURL=Transformer.js.map