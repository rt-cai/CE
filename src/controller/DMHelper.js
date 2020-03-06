"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const fs = require("fs");
const IInsightFacade_1 = require("./IInsightFacade");
class DMHelper {
    constructor(d, n, f, fr, dm, saves) {
        this.PATH = "./data/";
        this.addedDatasets = d;
        this.addedDatasetNames = n;
        this.fileMap = f;
        this.fileMapR = fr;
        this.dmg = dm;
        this.datasets = saves;
    }
    getNewFileID(datasetName) {
        let i = -1;
        while (true) {
            i++;
            if (!this.fileMapR.has(i.toString())) {
                break;
            }
        }
        this.fileMap.set(datasetName, i.toString());
        this.fileMapR.set(i.toString(), datasetName);
        return i.toString();
    }
    removeFile(id) {
        let f = this.fileMap.get(id);
        let filePath = `${this.PATH}${f}.json`;
        this.fileMap.delete(id);
        this.fileMapR.delete(f);
        Util_1.default.p(`removing directory "${filePath}" for dataset "${id}"`, "b");
        this.datasets.delete(parseInt(f, 10));
        try {
            fs.unlinkSync(filePath);
            Util_1.default.p(`"${filePath}" for dataset "${id}" deleted`, "w");
            return { msg: id, good: true };
        }
        catch (e) {
            Util_1.default.p(`error while removing file "${filePath}": "${e}"`, "y");
            return { msg: id, good: true };
        }
    }
    getFile(datasetName) {
        return new Promise((resolve) => {
            let fName = this.fileMap.get(datasetName);
            let filePath = `${this.PATH}${fName}.json`;
            Util_1.default.p(`getting "${filePath}"`, "b");
            let out = JSON.stringify(this.datasets.get(parseInt(fName, 10)));
            Util_1.default.p(`loaded "${datasetName}" from "${filePath}"`, "b");
            return resolve({ data: out, name: datasetName });
        });
    }
    badID(id) {
        if (id === undefined || id === null) {
            return `id cannot be null or undefined, given: "${id}"`;
        }
        if (id.length === 0) {
            return `id cannot be empty`;
        }
        if (id.includes("_")) {
            return `id: "${id}" cannot contain "_"`;
        }
        if (id.startsWith(" ") || id.endsWith(" ")) {
            return `id cannot have " ", given: "${id}"`;
        }
        else {
            for (let c of id) {
                if (c !== " ") {
                    return false;
                }
            }
        }
    }
    badParamsAdd(id, content, kind) {
        let msg = this.badID(id);
        if (msg) {
            return msg;
        }
        for (let addedId of this.addedDatasetNames) {
            if (id === addedId) {
                return `a dataset with the name "${id}" has already been added!`;
            }
        }
        if (!content || !kind) {
            return `bad param(s), given: content:\n"${content}"\nkind: "${kind}"`;
        }
        let invalidKind = true;
        for (let k of Object.values(IInsightFacade_1.InsightDatasetKind)) {
            if (kind === k) {
                invalidKind = false;
            }
        }
        if (invalidKind) {
            return "invalid kind";
        }
        return false;
    }
    badParamsRemove(id) {
        let msg = this.badID(id);
        if (msg) {
            return msg;
        }
        return false;
    }
    persist() {
        if (!fs.existsSync(this.PATH)) {
            fs.mkdirSync(this.PATH);
            return;
        }
        let files = fs.readdirSync(this.PATH);
        for (let f of files) {
            let file = fs.readFileSync(`${this.PATH}${f}`, "utf8");
            let ds = JSON.parse(file);
            let num = parseInt(f, 10);
            let id = ds.name;
            let kind = ds.kind === "rooms" ? IInsightFacade_1.InsightDatasetKind.Rooms : IInsightFacade_1.InsightDatasetKind.Courses;
            let l = ds.entries.length;
            let datasetProxy = { id: id, kind: kind, numRows: l };
            this.addedDatasets.push(datasetProxy);
            this.addedDatasetNames.push(id);
            this.fileMap.set(id, num.toString());
            this.fileMapR.set(num.toString(), id);
            this.datasets.set(num, ds);
            Util_1.default.p(`recovered ${num} as ${kind} dataset to file ${num}.json`, "b");
        }
    }
}
exports.default = DMHelper;
//# sourceMappingURL=DMHelper.js.map