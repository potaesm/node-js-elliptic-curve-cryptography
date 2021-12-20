const Point = require('./Point');

function main() {
    const a = -4;
    const b = 4;
    const P = new Point(-2, -2);

    /** Brute force */
    let newPoint = applyPointAddition(P, P, a, b);
    // console.log('2P: ', newPoint);
    for (let i = 3; i <= 100; i++) {
        newPoint = applyPointAddition(newPoint, P, a, b);
        // console.log(`${i}P: `, newPoint);
    }
    console.log('Brute force', newPoint);

    /** Double and add */
    const doubleAndAddPoint = applyDoubleAndAddMethod(P, 100, a, b);
    console.log('Double and add', doubleAndAddPoint);
}

main();

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

function applyDoubleAndAddMethod(P = new Point(), k = 0, a = 0, b = 0) {
    const kAsBinary = dec2bin(k);
    // console.log(`(${k})10 = (${kAsBinary})2`);
    let outputPoint = new Point(P.getPointX(), P.getPointY());
    for (let i = 1; i < kAsBinary.length; i++) {
        const currentBit = Number(kAsBinary[i]);
        // console.log(currentBit);
        outputPoint = applyPointAddition(outputPoint, outputPoint, a, b);
        if (currentBit === 1) {
            outputPoint = applyPointAddition(outputPoint, P, a, b);
        }
    }
    return outputPoint;
}

function applyPointAddition(P = new Point(), Q = new Point(), a = 0, b = 0) {
    const x1 = P.getPointX();
    const y1 = P.getPointY();
    const x2 = Q.getPointX();
    const y2 = Q.getPointY();
    let beta;
    if (x1 === x2 && y1 === y2) {
        /** Apply doubling */
        beta = ((3 * x1 * x1) + a) / (2 * y1);
    } else {
        /** Apply point addition */
        beta = (y2-y1)/(x2-x1)
    }
    const x3 = (beta * beta) - x1 - x2;
    const y3 = (beta * (x1 - x3)) - y1;

    const R = new Point(x3, y3);
    return R;
}
