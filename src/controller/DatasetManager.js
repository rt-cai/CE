"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IInsightFacade_1 = require("./IInsightFacade");
const Util_1 = require("../Util");
const DMHelper_1 = require("./DMHelper");
const JSZip = require("jszip");
const DMAbstractions_1 = require("./DMAbstractions");
let fs = require("fs");
class DatasetSave {
    constructor(n, e, i, k) {
        this.name = n;
        this.kind = k;
        this.entries = e;
        this.index = i;
    }
}
exports.DatasetSave = DatasetSave;
class DatasetManager {
    constructor() {
        this.PATH = "./data/";
        this.addedDatasets = [];
        this.addedDatasetNames = [];
        this.fileMap = new Map();
        this.fileMapR = new Map();
        this.datasets = new Map();
        this.helper = new DMHelper_1.default(this.addedDatasets, this.addedDatasetNames, this.fileMap, this.fileMapR, this, this.datasets);
        this.helper.persist();
    }
    writeSave(save, raw) {
        return new Promise((resolve, reject) => {
            let id = this.helper.getNewFileID(save.name);
            Util_1.default.p(`writing "${save.name}" to "${this.PATH}" as ${id}.json`, "b");
            let path = `${this.PATH}${id}.json`;
            fs.writeFileSync(path, `${JSON.stringify(save)}`);
            Util_1.default.p(`${id}.json created for "${save.name}" as a ${save.kind} dataset`, "w");
            this.datasets.set(parseInt(id, 10), save);
            return resolve(raw);
        });
    }
    getZipFiles(zip, kind) {
        let pFiles = [];
        let rkeys = Object.keys(zip.files);
        let keys = rkeys;
        let rawLength = rkeys.length;
        let i = keys.length - 1;
        while (i >= 0) {
            let k = keys[i];
            if (k.endsWith("/")) {
                Util_1.default.p(`folder \"${k}\" found`, "b");
                keys.splice(i, 1);
            }
            else if (!k.startsWith(`${kind}`)) {
                keys.splice(i, 1);
            }
            i--;
        }
        Util_1.default.p(`unzipping ${keys.length} items of ${rawLength}...`, "b");
        keys.forEach((key) => {
            pFiles.push(zip.file(key).async("text"));
        });
        return { files: pFiles, ks: keys };
    }
    addDataset(id, content, kind) {
        return new Promise((resolve, reject) => {
            let errMsg = this.helper.badParamsAdd(id, content, kind);
            if (errMsg) {
                reject(new IInsightFacade_1.InsightError(errMsg));
                return;
            }
            let pf = new DMAbstractions_1.ParserFactory(kind);
            let parser = pf.makeParser();
            let rawZip = new JSZip();
            Util_1.default.p(`>>> adding a ${kind} dataset as \"${id}\"...`);
            rawZip.loadAsync(content, { base64: true }).then((zip) => {
                let d = this.getZipFiles(zip, kind);
                let pFiles = d.files;
                let keys = d.ks;
                return Promise.all(pFiles).then((files) => {
                    let packs = [];
                    for (let i = 0; i < files.length; i++) {
                        packs.push({ name: keys[i], file: files[i] });
                    }
                    return Promise.resolve(packs);
                });
            }).then((data) => {
                Util_1.default.p(`unzipped...`, "b");
                return parser.parseEntries(data);
            }).then((parsed) => {
                if (parsed.length === 0) {
                    throw new Error(`no entries found!`);
                }
                let save = this.compileSave(id, parsed, parser);
                return this.writeSave(save, parsed);
            }).then((parsed) => {
                let datasetProxy = { id: id, kind: kind, numRows: parsed.length };
                this.addedDatasets.push(datasetProxy);
                this.addedDatasetNames.push(id);
                resolve([...this.addedDatasetNames]);
                return;
            }).catch((err) => {
                Util_1.default.p(err, "r");
                reject(new IInsightFacade_1.InsightError(`${err}`));
                return;
            });
        });
    }
    compileSave(id, parsed, parser) {
        Util_1.default.p(`compiling save...`, "b");
        let cleanedData = new Array(parsed.length);
        let i = 0;
        for (let section of parsed) {
            let v = Object.values(section);
            let cleanedEntry = new Array(v.length);
            let j = 0;
            for (let f of v) {
                cleanedEntry[j] = parser.compileEntry(j, v[j]);
                j++;
            }
            cleanedData[i] = cleanedEntry;
            i++;
        }
        Util_1.default.p(`${cleanedData.length} entries compiled`, "B");
        return new DatasetSave(id, cleanedData, [], parser.kind);
    }
    loadDataset(id) {
        Util_1.default.p(`>>> loading "${id}"`);
        return new Promise((resolve, reject) => {
            let found = false;
            for (let nme of this.addedDatasetNames) {
                if (id === nme) {
                    found = true;
                    break;
                }
            }
            return this.helper.getFile(id).then((d) => {
                let rName = d.name;
                let rd = JSON.parse(d.data);
                let set = rd.entries;
                let kind = rd.kind;
                let index = rd.index;
                let ret = new DatasetSave(rName, set, index, kind);
                Util_1.default.p(`"${rName}" loaded as DatasetSave`);
                return resolve(ret);
            });
        });
    }
    removeDataset(id) {
        return new Promise((resolve, reject) => {
            let errMsg = this.helper.badParamsRemove(id);
            if (errMsg) {
                reject(new IInsightFacade_1.InsightError(errMsg));
                return;
            }
            let found = false;
            let i = 0;
            for (let added of this.addedDatasetNames) {
                if (id === added) {
                    found = true;
                    break;
                }
                i++;
            }
            if (!found) {
                reject(new IInsightFacade_1.NotFoundError(`no such id: ${id}`));
                return;
            }
            Util_1.default.p(`>>> removing dataset "${id}"`, "w");
            this.addedDatasetNames.splice(i, 1);
            for (i = 0; i < this.addedDatasets.length; i++) {
                let d = this.addedDatasets[i];
                if (d.id === id) {
                    this.addedDatasets.splice(i, 1);
                    break;
                }
            }
            let msg = this.helper.removeFile(id);
            if (msg.good) {
                resolve(msg.msg);
            }
            else {
                reject(new IInsightFacade_1.InsightError(msg.msg));
            }
            return;
        });
    }
    getAddedDatasets() {
        return [...this.addedDatasets];
    }
    listDatasets() {
        return new Promise((resolve, reject) => {
            resolve(this.getAddedDatasets());
        });
    }
    getDatasetKind(id) {
        for (let d of this.getAddedDatasets()) {
            if (id === d.id) {
                return d.kind;
            }
        }
    }
}
exports.default = DatasetManager;
//# sourceMappingURL=DatasetManager.js.map