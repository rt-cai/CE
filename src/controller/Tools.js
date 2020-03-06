"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DistCalc {
    getMaxDist(locData, getX, getY) {
        switch (locData.length) {
            case 0:
                return Number.POSITIVE_INFINITY;
            case 1:
                return 0;
        }
        let max = -1;
        for (let i = 0; i < locData.length - 1; i++) {
            for (let ii = i + 1; ii < locData.length; ii++) {
                let d = locData[i];
                let dd = locData[ii];
                if (dd === undefined) {
                    return;
                }
                let x = getX(d) - getX(dd);
                let y = getY(d) - getY(dd);
                let m = Math.pow(x * x + y * y, 0.5);
                max = Math.max(m, max);
            }
        }
        return max;
    }
}
exports.DistCalc = DistCalc;
class Sorter {
    quickSort(arr, leftOri, rightOri, k) {
        let sections = [];
        sections.push({ l: leftOri, r: rightOri, d: 0 });
        while (sections.length > 0) {
            let section = sections.pop();
            let left = section.l;
            let right = section.r;
            let depth = section.d;
            if (depth >= k.length) {
                continue;
            }
            this.qs(arr, left, right, k, depth);
            let sample;
            let start = left, end;
            let diff = false;
            for (let i = left; i <= right; i++) {
                let curr = arr[i][k[depth]];
                if (sample !== curr) {
                    diff = true;
                    sample = curr;
                    end = i - 1;
                    if (end - start > 0) {
                        sections.push({ l: start, r: end, d: depth + 1 });
                    }
                    start = i;
                }
            }
            if (right - start > 0 && diff) {
                sections.push({ l: start, r: right, d: depth + 1 });
            }
        }
    }
    qs(arr, leftOri, rightOri, k, depth) {
        let sections = [];
        sections.push({ left: leftOri, right: rightOri });
        while (sections.length > 0) {
            let section = sections.pop();
            let left = section.left;
            let right = section.right;
            let l = right - left + 1;
            if (l <= 1) {
                continue;
            }
            let piv = right;
            let wall = left;
            for (let i = right - 1; i >= wall; i--) {
                if (i === wall) {
                    if (arr[wall][k[depth]] > arr[piv][k[depth]]) {
                        this.swap(arr, wall, piv);
                    }
                    break;
                }
                if (arr[i][k[depth]] < arr[piv][k[depth]]) {
                    this.swap(arr, i, wall);
                    wall++;
                    i++;
                }
            }
            sections.push({ left: left, right: wall });
            sections.push({ left: wall + 1, right: right });
        }
    }
    swap(arr, m, n) {
        let temp = arr[m];
        arr[m] = arr[n];
        arr[n] = temp;
    }
}
exports.Sorter = Sorter;
//# sourceMappingURL=Tools.js.map