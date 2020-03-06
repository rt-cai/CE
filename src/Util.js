"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Log {
    static trace(msg) {
        console.log(`<T> ${new Date().toLocaleString()}: ${msg}`);
    }
    static getC(c) {
        let col;
        c = c.toLowerCase();
        switch (c) {
            case "r":
                col = "31";
                break;
            case "b":
                col = "94";
                break;
            case "y":
                col = "33";
                break;
            case "p":
                col = "95";
                break;
            default:
                col = "30";
                break;
        }
        return col;
    }
    static p(msg, c = "") {
        let col = this.getC(c);
        console.log(`\x1b[100m\x1b[${col}m%s\x1b[0m`, `<P> ${new Date().toLocaleString()}: ${msg}`);
    }
    static info(msg) {
        console.info(`<I> ${new Date().toLocaleString()}: ${msg}`, "background: #222; color: #bada55");
    }
    static warn(msg) {
        console.warn(`<W> ${new Date().toLocaleString()}: ${msg}`);
    }
    static error(msg) {
        console.error(`<E> ${new Date().toLocaleString()}: ${msg}`);
    }
    static test(msg) {
        console.log(`<X> ${new Date().toLocaleString()}: ${msg}`);
    }
}
exports.default = Log;
//# sourceMappingURL=Util.js.map