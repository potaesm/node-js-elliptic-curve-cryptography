const bigIntModArith = require('bigint-mod-arith');
const Point = require('./Point');

const globalMod = generatePrimeModulo();

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

function findMultiplicativeInverse(bigInt = BigInt(0), mod = globalMod) {
    /** Extended Euclidean Algorithm */
    // b / a = b * (a^-1) mod p = b * c
    return bigIntModArith.modInv(bigInt, BigInt(mod));
}

function applyDoubleAndAddMethod(P = new Point(), k = BigInt(0), a = BigInt(0), b = BigInt(0), mod = globalMod) {
    const kAsBinary = k.toString(2);
    // console.log(`(${k.getValue()})10 = (${kAsBinary})2`);
    let outputPoint = new Point(P.getPointX(), P.getPointY());
    for (let i = 1; i < kAsBinary.length; i++) {
        const currentBit = Number(kAsBinary[i]);
        // console.log(currentBit);
        outputPoint = applyPointAddition(outputPoint, outputPoint, a, b, mod);
        if (currentBit === 1) {
            outputPoint = applyPointAddition(outputPoint, P, a, b, mod);
        }
    }
    return outputPoint;
}

function applyPointAddition(P = new Point(), Q = new Point(), a = BigInt(0), b = BigInt(0), mod = globalMod) {
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
        const times = (abs(x3) / mod) + 1n;
        x3 = x3 + (times * mod);
    }

    while (y3 < 0n) {
        const times = (abs(y3) / mod) + 1n;
        y3 = y3 + (times * mod);
    }

    x3 = x3 % mod;
    y3 = y3 % mod;

    const R = new Point(x3, y3);
    return R;
}
