import Log from "../Util";
import * as fs from "fs";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import DatasetManager, {DatasetSave} from "./DatasetManager";

export default class DMHelper {
    private addedDatasets: InsightDataset[];
    private addedDatasetNames: string[];
    private fileMap: Map<string, string>;
    private fileMapR: Map<string, string>;
    private readonly PATH: string = "./data/";
    private datasets: Map<number, DatasetSave>;
    private dmg: DatasetManager;

    constructor(d: InsightDataset[], n: string[], f: Map<string, string>,
                fr: Map<string, string>, dm: DatasetManager, saves: Map<number, DatasetSave>) {
        this.addedDatasets = d;
        this.addedDatasetNames = n;
        this.fileMap = f;
        this.fileMapR = fr;
        this.dmg = dm;
        this.datasets = saves;
    }

    public getNewFileID(datasetName: string): string {
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

    public removeFile(id: string): {msg: string, good: boolean} {
        let f = this.fileMap.get(id);
        let filePath = `${this.PATH}${f}.json`;
        this.fileMap.delete(id);
        this.fileMapR.delete(f);
        Log.p(`removing directory "${filePath}" for dataset "${id}"`, "b");
        this.datasets.delete(parseInt(f, 10));
        try {
            fs.unlinkSync(filePath);
            // this.removeFile(id);
            Log.p(`"${filePath}" for dataset "${id}" deleted`, "w");
            return {msg: id, good: true};
        } catch (e) {
            Log.p(`error while removing file "${filePath}": "${e}"`, "y");
            // return {msg: e, good: false};
            return {msg: id, good: true};
        }
    }

    public getFile(datasetName: string): Promise<{name: string, data: string}> {
        return new Promise<{name: string, data: string}>( (resolve) => {
            let fName: string | undefined = this.fileMap.get(datasetName);
            let filePath: string = `${this.PATH}${fName}.json`;
            // if (this.dmg.DEBUG && fName === undefined) {
            //     fName = this.dmg.DMAP.get(datasetName);
            //     filePath = `${this.dmg.dPATH}${fName}.json`;
            //     Log.p(`### DEBUG redirect to ${filePath}`, "P");
            // }

            Log.p(`getting "${filePath}"`, "b");

            let out: string = JSON.stringify(this.datasets.get(parseInt(fName, 10)));
            // deprecated >> using non disk data
            // let out: string = fs.readFileSync(filePath, "utf8");
            Log.p(`loaded "${datasetName}" from "${filePath}"`, "b");
            return resolve({data: out, name: datasetName});
        });
    }

    private badID(id: string): string | false {
        if (id === undefined || id === null) {
            return `id cannot be null or undefined, given: "${id}"`;
        }

        if (id.length === 0) {
            return `id cannot be empty`;
        }

        // underscore
        if (id.includes("_")) {
            return `id: "${id}" cannot contain "_"`;
        }

        if (id.startsWith(" ") || id.endsWith(" ")) {
            return `id cannot have " ", given: "${id}"`;
        } else {
            // all whitespace
            for (let c of id) {
                if (c !== " ") {
                    return false;
                }
            }
        }
    }

    public badParamsAdd(id: string, content: string, kind: InsightDatasetKind): string | false {
        let msg = this.badID(id);
        if (msg) {
            return msg;
        }

        // duplicate id
        for (let addedId of this.addedDatasetNames) {
            if (id === addedId) {
                return `a dataset with the name "${id}" has already been added!`;
            }
        }

        // non-null / und params
        if (!content || !kind) {
            return `bad param(s), given: content:\n"${content}"\nkind: "${kind}"`;
        }

        let invalidKind = true;
        for (let k of Object.values(InsightDatasetKind)) {
            if (kind === k) {
                invalidKind = false;
            }
        }
        if (invalidKind) {
            return "invalid kind";
        }

        return false;
    }

    public badParamsRemove(id: string): string | false {
        let msg = this.badID(id);
        if (msg) {
            return msg;
        }
        return false;
    }

    public persist(): void {
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
            let kind = ds.kind === "rooms" ? InsightDatasetKind.Rooms : InsightDatasetKind.Courses;
            let l = ds.entries.length;
            let datasetProxy: InsightDataset = {id: id, kind: kind, numRows: l};
            this.addedDatasets.push(datasetProxy);
            this.addedDatasetNames.push(id);
            this.fileMap.set(id, num.toString());
            this.fileMapR.set(num.toString(), id);
            this.datasets.set(num, ds);
            Log.p(`recovered ${num} as ${kind} dataset to file ${num}.json`, "b");
        }
    }
}
