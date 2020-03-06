"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const restify = require("restify");
const Util_1 = require("../Util");
const InsightFacade_1 = require("../controller/InsightFacade");
const IInsightFacade_1 = require("../controller/IInsightFacade");
class Server {
    constructor(port) {
        Util_1.default.info("Server::<init>( " + port + " )");
        this.port = port;
    }
    stop() {
        Util_1.default.info("Server::close()");
        const that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }
    start() {
        const that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Util_1.default.info("Server::start() - start");
                that.rest = restify.createServer({
                    name: "insightUBC",
                });
                that.rest.use(restify.bodyParser({ mapFiles: true, mapParams: true }));
                that.rest.use(function crossOrigin(req, res, next) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    return next();
                });
                that.rest.get("/echo/:msg", Server.echo);
                that.rest.put("/dataset/:id/:kind", Server.putCallback);
                that.rest.del("/dataset/:id", Server.delCallback);
                that.rest.post("/query", Server.postCallback);
                that.rest.get("/datasets", Server.getCallback);
                that.rest.get("/.*", Server.getStatic);
                that.rest.listen(that.port, function () {
                    Util_1.default.info("Server::start() - restify listening: " + that.rest.url);
                    fulfill(true);
                });
                that.rest.on("error", function (err) {
                    reject(err);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    static putCallback(req, res, next) {
        try {
            let content = req.body.toString("base64");
            let kind = req.params.kind.toString();
            let result = Server.insight.addDataset(req.params.id, content, kind);
            result.then((ids) => {
                res.send(200, { result: ids });
            }).catch((err) => {
                res.json(400, { error: err.toString() });
            });
        }
        catch (e) {
            res.json(400, { error: e.toString() });
        }
        return next();
    }
    static delCallback(req, res, next) {
        let result = Server.insight.removeDataset(req.params.id);
        result.then((ids) => {
            res.send(200, { result: ids });
        }).catch((err) => {
            if (err instanceof IInsightFacade_1.InsightError) {
                res.send(400, { error: err.toString() });
            }
            else {
                res.send(404, { error: err.toString() });
            }
        });
        return next();
    }
    static postCallback(req, res, next) {
        try {
            let result = Server.insight.performQuery(JSON.parse(req.body));
            result.then((ids) => {
                res.send(200, { result: ids });
            }).catch((err) => {
                res.json(400, { error: err.message });
            });
        }
        catch (e) {
            res.json(400, { error: e.message });
            return next();
        }
        return next();
    }
    static getCallback(req, res, next) {
        let result = Server.insight.listDatasets();
        result.then((ids) => {
            res.send(200, { result: ids });
        });
        return next();
    }
    static echo(req, res, next) {
        Util_1.default.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        const response = Server.performEcho(req.params.msg);
        Util_1.default.info("Server::echo(..) - responding " + 200);
        res.json(200, { result: response });
        return next();
    }
    static performEcho(msg) {
        if (typeof msg !== "undefined" && msg !== null && msg !== "") {
            return `${msg}...${msg}`;
        }
        else {
            return "Message not provided";
        }
    }
    static getStatic(req, res, next) {
        const publicDir = "frontend/public/";
        Util_1.default.trace("RoutHandler::getStatic::" + req.url);
        let path = publicDir + "index.html";
        if (req.url !== "/") {
            path = publicDir + req.url.split("/").pop();
        }
        fs.readFile(path, function (err, file) {
            if (err) {
                res.send(500);
                Util_1.default.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }
}
Server.insight = new InsightFacade_1.default();
exports.default = Server;
//# sourceMappingURL=Server.js.map