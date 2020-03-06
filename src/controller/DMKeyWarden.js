"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KeyWarden {
    constructor(k) {
        this.keys = k;
    }
    map(str) {
        return this.keys[str];
    }
}
exports.KeyWarden = KeyWarden;
//# sourceMappingURL=DMKeyWarden.js.map