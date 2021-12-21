const bigIntModArith = require('bigint-mod-arith');
const Point = require('./Point');

const globalMod = 23n;

function main() {
    const a = BigInt(-4);
    const b = BigInt(4);
    const P = new Point(BigInt(-2), BigInt(-2));

    // /** Brute force */
    // let newPoint = applyPointAddition(P, P, a, b);
    // // console.log('2P: ', newPoint);
    // for (let i = 3; i <= 100; i++) {
    //     newPoint = applyPointAddition(newPoint, P, a, b);
    //     // console.log(`${i}P: `, newPoint);
    // }
    // console.log('Brute force\n', newPoint.getPoint());

    // /** Double and add */
    // const doubleAndAddPoint = applyDoubleAndAddMethod(P, 100, a, b);
    // console.log('Double and add\n', doubleAndAddPoint.getPoint());

    /** Private key of Alice */
    const ka = BigInt('100021');
    /** Private key of Bob */
    const kb = BigInt('100077');
    /** Key exchange - Elliptic Curve Diffie Hellman */
    const alicePublicKey = applyDoubleAndAddMethod(P, ka, a, b);
    const bobPublicKey = applyDoubleAndAddMethod(P, kb, a, b);
    console.log({
        alicePrivateKey: ka,
        alicePublicKey: alicePublicKey.getPoint(),
        bobPrivateKey: kb,
        bobPublicKey: bobPublicKey.getPoint()
    });
    const aliceSharedKey = applyDoubleAndAddMethod(bobPublicKey, ka, a, b);
    const bobSharedKey = applyDoubleAndAddMethod(alicePublicKey, kb, a, b);
    console.log({
        aliceSharedKey: aliceSharedKey.getPoint(),
        bobSharedKey: bobSharedKey.getPoint()
    });
}

main();

function findMultiplicativeInverse(bigInt = BigInt(0), mod = globalMod) {
    /** Extended Euclidean Algorithm */
    // b / a = b * (a^-1) mod p = b * c
    return bigIntModArith.modInv(bigInt, BigInt(mod));
}

function applyDoubleAndAddMethod(P = new Point(), k = BigInt(0), a = BigInt(0), b = BigInt(0), precision = 100) {
    const kAsBinary = k.toString(2);
    // console.log(`(${k.getValue()})10 = (${kAsBinary})2`);
    let outputPoint = new Point(P.getPointX(), P.getPointY());
    for (let i = 1; i < kAsBinary.length; i++) {
        const currentBit = Number(kAsBinary[i]);
        // console.log(currentBit);
        outputPoint = applyPointAddition(outputPoint, outputPoint, a, b, precision);
        if (currentBit === 1) {
            outputPoint = applyPointAddition(outputPoint, P, a, b, precision);
        }
    }
    return outputPoint;
}

function applyPointAddition(P = new Point(), Q = new Point(), a = BigInt(0), b = BigInt(0), precision = 100) {
    const x1 = P.getPointX();
    const y1 = P.getPointY();
    const x2 = Q.getPointX();
    const y2 = Q.getPointY();
    let beta;
    if (x1 == x2 && y1 == y2) {
        /** Apply doubling */
        beta = ((3n * x1 * x1) + a) * findMultiplicativeInverse(2n * y1);
    } else {
        /** Apply point addition */
        beta = (y2 - y1) * findMultiplicativeInverse(x2 - x1);
    }
    let x3 = (beta * beta) - x1 - x2;
    let y3 = (beta * (x1 - x3)) - y1;

    while (x3 < 0n) {
        const abs = (x) => {
            return x < 0n ? -x : x
        };
        const times = (abs(x3) / globalMod) + 1n;
        x3 = x3 + (times * globalMod);
    }

    while (y3 < 0n) {
        const abs = (x) => {
            return x < 0n ? -x : x
        };
        const times = (abs(y3) / globalMod) + 1n;
        y3 = y3 + (times * globalMod);
    }

    const R = new Point(x3, y3);
    return R;
}
