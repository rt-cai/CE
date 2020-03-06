"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IInsightFacade_1 = require("./IInsightFacade");
const DMParserCourses_1 = require("./DMParserCourses");
const DMParserRooms_1 = require("./DMParserRooms");
class ParserFactory {
    constructor(k) {
        this.kind = k;
    }
    makeParser() {
        switch (this.kind) {
            case IInsightFacade_1.InsightDatasetKind.Rooms:
                return new DMParserRooms_1.ParserRooms();
            default:
                return new DMParserCourses_1.ParserCourses();
        }
    }
}
exports.ParserFactory = ParserFactory;
//# sourceMappingURL=DMAbstractions.js.map