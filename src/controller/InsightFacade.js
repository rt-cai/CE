"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../Util");
const Queryer_1 = require("./Queryer");
const DatasetManager_1 = require("./DatasetManager");
class InsightFacade {
    constructor() {
        this.dMgr = new DatasetManager_1.default();
        Util_1.default.trace("InsightFacadeImpl::init()");
    }
    addDataset(id, content, kind) {
        return this.dMgr.addDataset(id, content, kind);
    }
    removeDataset(id) {
        return this.dMgr.removeDataset(id);
    }
    performQuery(query) {
        let q = new Queryer_1.default(this.dMgr);
        return q.doJob(query);
    }
    listDatasets() {
        return this.dMgr.listDatasets();
    }
}
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map