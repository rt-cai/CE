"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IInsightFacade_1 = require("./IInsightFacade");
const Util_1 = require("../Util");
const DMhttps_1 = require("./DMhttps");
let parse5 = require("parse5");
class ParserRooms {
    constructor() {
        this.kind = IInsightFacade_1.InsightDatasetKind.Rooms;
        this.fieldMap = {
            fullname: 0,
            shortname: 1,
            number: 2,
            name: 3,
            address: 4,
            lat: 5,
            lon: 6,
            seats: 7,
            type: 8,
            furniture: 9,
            href: 10
        };
        this.locator = new DMhttps_1.GeoLocator();
    }
    parse(file) {
        return parse5.parse(file);
    }
    treeSearch(tree, match) {
        if (match(tree)) {
            return [tree];
        }
        if (tree.childNodes === undefined) {
            return false;
        }
        let bucket = [];
        for (let n of tree.childNodes) {
            let result = this.treeSearch(n, match);
            if (result !== false) {
                bucket = bucket.concat(result);
            }
        }
        if (bucket.length === 0) {
            return false;
        }
        else {
            return bucket;
        }
    }
    getFileCommon(file) {
        let result = this.treeSearch(file, (node) => {
            let attrs = node.attrs;
            if (attrs !== undefined) {
                for (let a of attrs) {
                    if (a.name === "id" && a.value === "building-info") {
                        return true;
                    }
                }
            }
            return false;
        });
        if (!result) {
            return false;
        }
        let n = result[0];
        let name = n.childNodes[1].childNodes[0].childNodes[0].value;
        let address = n.childNodes[3].childNodes[0].childNodes[0].value;
        return { fullName: name, address: address };
    }
    getHrefAndNumber(field) {
        let result = {};
        let found = 0;
        for (let n of field.childNodes) {
            if (n.nodeName === "a") {
                for (let a of n.attrs) {
                    if (a.name === "href") {
                        result.href = a.value;
                        found++;
                    }
                }
                found++;
                result.num = n.childNodes[0].value;
            }
        }
        return result;
    }
    getFields(rawEntry, candidates) {
        let result = new Map();
        for (let field of rawEntry.childNodes) {
            if (field.attrs === undefined) {
                continue;
            }
            for (let attr of field.attrs) {
                if (candidates.has(attr.value)) {
                    let fName = candidates.get(attr.value);
                    if (fName === "number") {
                        let d = this.getHrefAndNumber(field);
                        result.set(fName, d.num);
                        result.set("href", d.href);
                    }
                    else {
                        let value = field.childNodes[0].value;
                        value = value.substring(1);
                        value = value.trim();
                        result.set(fName, value);
                    }
                }
            }
        }
        return result;
    }
    constructEntry(parsed, commons) {
        let tables = this.treeSearch(parsed, (node) => {
            return node.nodeName === "tbody";
        });
        if (!tables) {
            return false;
        }
        let entries = [];
        let candidates = new Map();
        candidates.set("views-field views-field-field-room-number", "number");
        candidates.set("views-field views-field-field-room-capacity", "seats");
        candidates.set("views-field views-field-field-room-type", "type");
        candidates.set("views-field views-field-field-room-furniture", "furniture");
        for (let t of tables) {
            for (let rawEntry of t.childNodes) {
                if (rawEntry.nodeName !== "tr") {
                    continue;
                }
                let entry = Array(Object.keys(this.fieldMap).length);
                let fields = this.getFields(rawEntry, candidates);
                fields.set("fullname", commons.fullName);
                fields.set("shortname", commons.name);
                fields.set("address", commons.address);
                fields.set("name", `${commons.name}_${fields.get("number")}`);
                for (let key of fields.keys()) {
                    entry[this.fieldMap[key]] = fields.get(key);
                }
                entries.push(entry);
            }
        }
        return entries;
    }
    addLocations(entries) {
        let responses = [];
        for (let ele of entries) {
            responses.push(this.locator.getLocation(ele[this.fieldMap["address"]]).then((res) => {
                return { loc: res, entry: ele };
            }));
        }
        return Promise.all(responses).then((res) => {
            let accepted = [];
            let reject = 0;
            for (let r of res) {
                if (r.loc.error) {
                    reject++;
                    continue;
                }
                r.entry[this.fieldMap["lat"]] = r.loc.lat;
                r.entry[this.fieldMap["lon"]] = r.loc.lon;
                accepted.push(r.entry);
            }
            Util_1.default.p(`rejected ${reject} locations`, "B");
            return accepted;
        });
    }
    parseEntries(files) {
        let acceptedEntries = [];
        let i = -1;
        let parsed;
        for (let f of files) {
            i++;
            parsed = this.parse(f.file);
            let commons = this.getFileCommon(parsed);
            if (!commons) {
                continue;
            }
            commons.name = f.name.substring(f.name.lastIndexOf("/") + 1);
            let entries = this.constructEntry(parsed, commons);
            if (!entries) {
                continue;
            }
            acceptedEntries = acceptedEntries.concat(entries);
        }
        Util_1.default.p(`${acceptedEntries.length} valid entries`, "b");
        Util_1.default.p(`adding locations...`, "b");
        return this.addLocations(acceptedEntries);
    }
    compileEntry(fieldID, entry) {
        return fieldID === 7 ? parseInt(entry, 10) : fieldID < 7 && fieldID > 4 ? parseFloat(entry) : entry;
    }
}
exports.ParserRooms = ParserRooms;
//# sourceMappingURL=DMParserRooms.js.map