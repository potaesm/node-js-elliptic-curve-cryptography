const bitcoinConfig = require('./BitcoinConfig');
const Point = require('./Point');

/** Modulo p */
const globalModulo = bitcoinConfig.modulo;
/** Curve Equation y^2 = x^3 + ax + b */
const { a, b } = bitcoinConfig;
/** Base Point On The Curve */
let P = new Point(bitcoinConfig.basePointX, bitcoinConfig.basePointY);
P = new Point(2n, 24n);

function main() {
    /*********************************************************************************************** */
    /** Brute Force - Get New Point And Order Of Group (By Counting Points In Finite Field For Small Number) */
    let modulo = globalModulo;
    modulo = 199n;
    console.log('P: ', P);
    let newPoint = applyPointAddition(P, P, a, b, modulo);
    console.log('2P: ', newPoint);
    for (let i = 3n; i <= 300n; i++) {
        try {
            newPoint = applyPointAddition(newPoint, P, a, b, modulo);
            console.log(`${i}P: `, newPoint);
        } catch (error) {
            console.log('Order of group: ', i);
            break;
        }
    }
    console.log('Brute force\n', newPoint.getPoint());

    /** Double And Add - Get New Point */
    const doubleAndAddPoint = applyDoubleAndAddMethod(P, 210n, a, b, modulo);
    console.log('Double and add\n', doubleAndAddPoint.getPoint());

    /** Baby Step Giant Step Approach */
    const orderOfGroup = getOrderOfGroup(P, a, b, modulo);
    console.log({ orderOfGroup });
}

main();


function getOrderOfGroup(P = new Point(), a = BigInt(0), b = BigInt(0), modulo = globalModulo) {
    const sqrt = require('bigint-isqrt');
    const Q = applyDoubleAndAddMethod(P, (modulo + 1n), a, b, modulo);
    const m = BigInt(sqrt(sqrt(modulo)) + 1n);
    for (let j = 1n; j <= m; j = j + 1n) {
        const jP = applyDoubleAndAddMethod(P, j, a, b, modulo);
        for (let k = m * BigInt(-1); k <= m; k = k + 1n) {
            let checkPoint = applyDoubleAndAddMethod(P, (2n * m * k), a, b, modulo);
            checkPoint = applyPointAddition(checkPoint, Q, a, b, modulo);
            if (checkPoint.getPointX() == jP.getPointX()) {
                const r = modulo + 1n + (2n * m * k);
                /** Auto Proof Order Of Group */
                const rAddJ = r + j;
                const rSubJ = r - j;
                try {
                    applyDoubleAndAddMethod(P, rAddJ, a, b, modulo);
                } catch (error) {
                    return rAddJ;
                }
                try {
                    applyDoubleAndAddMethod(P, rSubJ, a, b, modulo);
                } catch (error) {
                    return rSubJ;
                }
            }
        }
    }
    return null;
}

function multiplicativeInverse(a = BigInt(0), modulo = globalModulo) {
    /** Extended Euclidean Algorithm To Find Multiplicative Inverse [a^-1 modulo p] = c */
    // b / a = b * [(a^-1) modulo p] = b * c
    while (a < 0n) {
        a = a + modulo;
    }
    let x1 = BigInt(1);
    let x2 = BigInt(0);
    let x3 = modulo;
    let y1 = BigInt(0);
    let y2 = BigInt(1);
    let y3 = a;
    let q = x3 / y3;
    let t1 = x1 - (q * y1);
    let t2 = x2 - (q * y2);
    let t3 = x3 - (q * y3);
    while (y3 != 1n) {
        x1 = y1;
        x2 = y2;
        x3 = y3;
        y1 = t1;
        y2 = t2;
        y3 = t3;
        q = x3 / y3;
        t1 = x1 - (q * y1);
        t2 = x2 - (q * y2);
        t3 = x3 - (q * y3);
    }
    while (y2 < 0) {
        y2 = y2 + modulo;
    }
    return y2;
}

function applyDoubleAndAddMethod(P = new Point(), k = BigInt(0), a = BigInt(0), b = BigInt(0), modulo = globalModulo) {
    const kAsBinary = k.toString(2);
    // console.log(`(${k.getValue()})10 = (${kAsBinary})2`);
    let outputPoint = new Point(P.getPointX(), P.getPointY());
    for (let i = 1; i < kAsBinary.length; i++) {
        const currentBit = Number(kAsBinary[i]);
        // console.log(currentBit);
        outputPoint = applyPointAddition(outputPoint, outputPoint, a, b, modulo);
        if (currentBit === 1) {
            outputPoint = applyPointAddition(outputPoint, P, a, b, modulo);
        }
    }
    return outputPoint;
}

function applyPointAddition(P = new Point(), Q = new Point(), a = BigInt(0), b = BigInt(0), modulo = globalModulo) {
    const x1 = P.getPointX();
    const y1 = P.getPointY();
    const x2 = Q.getPointX();
    const y2 = Q.getPointY();
    let beta;
    if (x1 == x2 && y1 == y2) {
        /** Apply doubling */
        beta = ((3n * x1 * x1) + a) * multiplicativeInverse(2n * y1, modulo);
    } else {
        /** Apply point addition */
        beta = (y2 - y1) * multiplicativeInverse(x2 - x1, modulo);
    }
    let x3 = (beta * beta) - x1 - x2;
    let y3 = (beta * (x1 - x3)) - y1;

    const abs = (x) => {
        return x < 0n ? -x : x;
    };

    while (x3 < 0n) {
        const times = (abs(x3) / modulo) + 1n;
        x3 = x3 + (times * modulo);
    }

    while (y3 < 0n) {
        const times = (abs(y3) / modulo) + 1n;
        y3 = y3 + (times * modulo);
    }

    x3 = x3 % modulo;
    y3 = y3 % modulo;

    const R = new Point(x3, y3);
    return R;
}
