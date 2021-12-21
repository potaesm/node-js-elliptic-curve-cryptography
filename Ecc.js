const Point = require('./Point');

const globalModulo = generatePrimeModulo();

function main() {
    const a = BigInt(1);
    const b = BigInt(1);
    const P = new Point(BigInt(3), BigInt(10));

    // // console.log('P: ', P);
    // /** Brute force */
    // let newPoint = applyPointAddition(P, P, a, b);
    // // console.log('2P: ', newPoint);
    // for (let i = 3; i <= 100; i++) {
    //     try {
    //         newPoint = applyPointAddition(newPoint, P, a, b);
    //         // console.log(`${i}P: `, newPoint);
    //     } catch (error) {
    //         break;
    //     }
    // }
    // console.log('Brute force\n', newPoint.getPoint());

    // /** Double and add */
    // const doubleAndAddPoint = applyDoubleAndAddMethod(P, 100, a, b);
    // console.log('Double and add\n', doubleAndAddPoint.getPoint());

    /** Private key of Alice */
    const ka = BigInt('100000000021');
    /** Private key of Bob */
    const kb = BigInt('100000000077');
    /** Key exchange - Elliptic Curve Diffie Hellman */
    let timeStart, timeStop;
    timeStart = new Date();
    const alicePublicKey = applyDoubleAndAddMethod(P, ka, a, b);
    timeStop = new Date();
    console.log(`Public key generation time: `, timeStop.valueOf() - timeStart.valueOf(), 'ms');
    const bobPublicKey = applyDoubleAndAddMethod(P, kb, a, b);
    console.log({
        alicePrivateKey: ka,
        alicePublicKey: alicePublicKey.getPoint(),
        bobPrivateKey: kb,
        bobPublicKey: bobPublicKey.getPoint()
    });
    timeStart = new Date();
    const aliceSharedKey = applyDoubleAndAddMethod(bobPublicKey, ka, a, b);
    timeStop = new Date();
    console.log(`Shared key generation time: `, timeStop.valueOf() - timeStart.valueOf(), 'ms');
    const bobSharedKey = applyDoubleAndAddMethod(alicePublicKey, kb, a, b);
    console.log({
        aliceSharedKey: aliceSharedKey.getPoint(),
        bobSharedKey: bobSharedKey.getPoint()
    });
}

main();

function generatePrimeModulo() {
    // secp256k1
    // 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 1
    return (2n ** 256n) - (2n ** 32n) - (2n ** 9n) - (2n ** 8n) - (2n ** 7n) - (2n ** 6n) - (2n ** 4n) - 1n;
}

// function findMultiplicativeInverse(a = BigInt(0), modulo = globalModulo) {
//     /** Find Multiplicative Inverse [a^-1 modulo p] = c */
//     // b / a = b * [(a^-1) modulo p] = b * c
//     return require('bigint-mod-arith').modInv(a, BigInt(modulo));
// }

function findMultiplicativeInverse(a = BigInt(0), modulo = globalModulo) {
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
        beta = ((3n * x1 * x1) + a) * findMultiplicativeInverse(2n * y1);
    } else {
        /** Apply point addition */
        beta = (y2 - y1) * findMultiplicativeInverse(x2 - x1);
    }
    let x3 = (beta * beta) - x1 - x2;
    let y3 = (beta * (x1 - x3)) - y1;

    const abs = (x) => {
        return x < 0n ? -x : x
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
