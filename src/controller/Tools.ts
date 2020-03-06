// import {mkdir} from "fs";
// import {isNegativeNumberLiteral} from "tslint";

import {SchedRoom} from "../scheduler/IScheduler";
// export class DistData {
//     public x: number;
//     public y: number;
//     public i: number;
//     public l: number;
//     constructor (x: number, y: number, i: number, l: number) {
//         this.x = x;
//         this.y = y;
//         this.i = i;
//         this.l = l;
//     }
// }

export class DistCalc {
    // private readonly SCALE = 1000;
    // private toRadial(x: number, y: number): {r: number, l: number} {
    //     if (x === 0) {
    //         return y > 0 ? {r: Math.PI / 2, l: y} : {r: Math.PI / -2, l: y};
    //     }
    //
    //     let r = Math.atan(y / x);
    //     if (x < 0) {
    //         r = y > 0 ? r + Math.PI : r - Math.PI;
    //     }
    //     return {r: r, l: this.fromOrigin(x, y)};
    // }
    //
    // private fromOrigin(x: number, y: number): number {
    //     return Math.pow(x * x + y * y, 0.5);
    // }
    //
    // public normalize(locData: any[], getX: (d: any) => number,
    //                  getY: (d: any) => number): DistData[] {
    //     let sumX = 0, sumY = 0;
    //     for (let p of locData) {
    //         sumX += getX(p);
    //         sumY += getY(p);
    //     }
    //     let aX = sumX / locData.length;
    //     let aY = sumY / locData.length;
    //
    //     let result: DistData[] = Array(locData.length);
    //     let i = 0;
    //     for (let p of locData) {
    //         let x = getX(p) - aX;
    //         let y = getY(p) - aY;
    //         result[i] = new DistData(x, y, i, this.fromOrigin(x, y));
    //         i++;
    //     }
    //     return result;
    // }

    public getMaxDist(locData: any[],
                      getX: (d: any) => number, getY: (d: any) => number): number {
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
                    return ;
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

export class Sorter {
    public quickSort(arr: any[], leftOri: number, rightOri: number, k: string[]): void {
        let sections: Array<{l: number, r: number, d: number}> = [];
        sections.push({l: leftOri, r: rightOri, d: 0});
        while (sections.length > 0) {
            let section = sections.pop();
            let left = section.l;
            let right = section.r;
            let depth = section.d;

            if (depth >= k.length) {    // no tie breaker
                continue;
            }

            this.qs(arr, left, right, k, depth);   // sort at depth

            let sample;
            let start = left, end;
            let diff = false;
            for (let i = left; i <= right; i++) {       // find tied sections
                let curr = arr[i][k[depth]];
                if (sample !== curr) {
                    diff = true;
                    sample = curr;
                    end = i - 1;

                    if (end - start > 0) {
                        sections.push({l: start, r: end, d: depth + 1});
                    }
                    start = i;
                }
            }
            if (right - start > 0 && diff) {
                sections.push({l: start, r: right, d: depth + 1});
            }
        }
    }

    private qs(arr: any[], leftOri: number, rightOri: number, k: string[], depth: number): void {
        // Log.p(`${l} : ${left} : ${right}`, "r");
        let sections: Array<{left: number, right: number}> = [];
        sections.push({left: leftOri, right: rightOri});

        while (sections.length > 0) {
            // Log.p(`${lefts}`, "r");
            let section = sections.pop();
            let left: number = section.left;
            let right: number = section.right;

            let l = right - left + 1;
            if (l <= 1) {               // 1 or 0 element array
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

            sections.push({left: left, right: wall});
            sections.push({left: wall + 1, right: right});
        }
    }

    private swap(arr: any[], m: number, n: number) {
        let temp = arr[m];
        arr[m] = arr[n];
        arr[n] = temp;
    }
}
