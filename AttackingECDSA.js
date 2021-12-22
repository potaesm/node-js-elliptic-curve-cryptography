const bitcoinConfig = require('./BitcoinConfig');
const Point = require('./Point');

/** Modulo p */
const globalModulo = bitcoinConfig.modulo;
/** Curve Equation y^2 = x^3 + ax + b */
const { a, b } = bitcoinConfig;
/** Base Point On The Curve */
const P = new Point(bitcoinConfig.basePointX, bitcoinConfig.basePointY);
/** Point Of The Finite Field - Order Of Group */
const order = bitcoinConfig.order;

function main() {
    /** Attacking Elliptic Curve Digital Signature Algorithm (ECDSA) */
    /** When the random key is constant (The random key is not randomized!) */

    /** 1. Get different signatures from different transactions */
    /** Hashing */
    console.log('-------------------- Hashing --------------------');
    const text1 = 'Text 1';
    const text2 = 'Text 2';
    const hash1 = cryptoHash(text1);
    const hash2 = cryptoHash(text2);
    console.log({ text1, text2 }, { hash1, hash2 });
    /** Private Key And Public Key */
    console.log('-------------------- Private Key And Public Key --------------------');
    const privateKey = bitcoinConfig.privateKey;
    const publicKey = applyDoubleAndAddMethod(P, privateKey, a, b);
    console.log({ privateKey, publicKey: publicKey.getPoint() });
    /** Random Key And Random Point */
    console.log('-------------------- Random Key And Random Point --------------------');
    const constantRandomKey = BigInt('28695618543805844332113829720373285210420739438570883203839696518176414791234');
    const randomKey1 = constantRandomKey;
    const randomKey2 = constantRandomKey;
    const randomPoint1 = applyDoubleAndAddMethod(P, randomKey1, a, b);
    const randomPoint2 = applyDoubleAndAddMethod(P, randomKey2, a, b);
    console.log({ randomKey1, randomPoint1: randomPoint1.getPoint() }, { randomKey2, randomPoint2: randomPoint2.getPoint() });
    /** Signature */
    console.log('-------------------- Signature --------------------');
    const r1 = randomPoint1.getPointX() % order;
    const r2 = randomPoint2.getPointX() % order;
    const s1 = ((hash1 + (r1 * privateKey)) * multiplicativeInverse(randomKey1, order)) % order;
    const s2 = ((hash2 + (r2 * privateKey)) * multiplicativeInverse(randomKey2, order)) % order;
    console.log({ r1, s1 }, { r2, s2 });
    /** Summary */
    console.log('-------------------- Summary --------------------');
    console.log('randomKey1 == randomKey2 ? ', randomKey1 == randomKey2);
    console.log('r1 == r2 ? ', r1 == r2);

    /** 2. Use those signatures to get a constant random key back */
    /**
     * s1 - s2 = (randomKey^-1) * (hash1 - hash2) mod order
     * randomKey^-1 = (s1 - s2) * [(hash1 - hash2)^-1] mod order
     * */
    const regeneratedRandomKeyInv = (s1 - s2) * multiplicativeInverse(hash1 - hash2, order) % order;
    const regeneratedRandomKey = multiplicativeInverse(regeneratedRandomKeyInv, order) % order;
    console.log({ regeneratedRandomKey });

}

main();

function cryptoHash(...inputs) {
    const hash = require('crypto').createHash('sha256');
    hash.update(inputs.map(input => (typeof input === 'string') ? input : JSON.stringify(input)).sort().join(' '));
    return hex2bigInt(hash.digest('hex'));
};

function hex2bigInt(hex) {
    if (hex.length % 2) { hex = '0' + hex }
    return BigInt('0x' + hex);
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
        beta = ((3n * x1 * x1) + a) * multiplicativeInverse(2n * y1);
    } else {
        /** Apply point addition */
        beta = (y2 - y1) * multiplicativeInverse(x2 - x1);
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
