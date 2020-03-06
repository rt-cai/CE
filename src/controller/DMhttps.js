"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
class GeoLocator {
    constructor() {
        this.PATHb = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team";
        this.TEAM = 116;
    }
    getLocation(address) {
        while (address.includes(" ")) {
            address = address.replace(" ", "%20");
        }
        return new Promise((resolve) => {
            http.get(`${this.PATHb}${this.TEAM}/${address}`, (res) => {
                res.on("data", (d) => {
                    resolve(JSON.parse(d.toString()));
                });
            }).on("error", (e) => {
                resolve(e);
            });
        });
    }
}
exports.GeoLocator = GeoLocator;
//# sourceMappingURL=DMhttps.js.map