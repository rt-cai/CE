"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tools_1 = require("./Tools");
class Options {
    constructor(q, trans, keys, rules, t) {
        this.queryer = q;
        this.trans = trans;
        this.keys = keys;
        this.rules = rules;
        this.t = t;
    }
    conformer(options) {
        let response;
        if (this.trans.length === 0) {
            response = this.displaySections(options, this.queryer.record, this.queryer.sections);
        }
        else {
            response = this.displaySectionsTransformed(options);
        }
        if (Array.isArray(response)) {
            if (response.length > 5000) {
                return false;
            }
            response = this.sort(response, options.ORDER);
        }
        return response;
    }
    displaySections(options, record, sections) {
        let result = new Array(0);
        let cols = options.COLUMNS;
        let i = 0;
        for (let sect of sections) {
            if (record[i]) {
                let row = {};
                for (let col of cols) {
                    let n = this.queryer.getIndex(col);
                    row[`${col}`] = sections[i][n];
                }
                result.push(row);
            }
            i++;
        }
        return result;
    }
    displaySectionsTransformed(options) {
        let result = new Array(0);
        let cols = options.COLUMNS;
        for (let tran of this.trans) {
            result.push({});
        }
        for (let col of cols) {
            if (this.keys.includes(col)) {
                let i = 0;
                for (let group of this.trans) {
                    let row = result[i];
                    let arr = Object.values(group)[0][0];
                    row[`${col}`] = arr[this.t.getIndex(`${col}`)];
                    i++;
                }
            }
            else {
                let i = 0;
                for (let group of this.trans) {
                    let row = result[i];
                    row[`${col}`] = Object.values(group)[0][this.t.getIndexR(`${col}`) + 1];
                    i++;
                }
            }
        }
        return result;
    }
    sort(result, order) {
        if (order === undefined || result.length === 0) {
            return result;
        }
        if (typeof (order) === "string") {
            let sorter = new Tools_1.Sorter();
            sorter.quickSort(result, 0, result.length - 1, [order]);
            return result;
        }
        else {
            let ord = order.keys;
            if (ord.length === 0) {
                return result;
            }
            let sorter = new Tools_1.Sorter();
            sorter.quickSort(result, 0, result.length - 1, ord);
            return order.dir === "UP" ? result : result.reverse();
        }
    }
}
exports.Options = Options;
//# sourceMappingURL=Options.js.map