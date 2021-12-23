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
    /*********************************************************************************************** */
    // /** Brute Force - Get New Point And Order Of Group (By Counting Points In Finite Field) */
    // console.log('P: ', P);
    // let newPoint = applyPointAddition(P, P, a, b);
    // console.log('2P: ', newPoint);
    // for (let i = 3n; i <= 999n; i++) {
    //     try {
    //         newPoint = applyPointAddition(newPoint, P, a, b);
    //         console.log(`${i}P: `, newPoint);
    //     } catch (error) {
    //         console.log('Order of group: ', i);
    //         break;
    //     }
    // }
    // console.log('Brute force\n', newPoint.getPoint());

    // /** Double And Add - Get New Point */
    // const doubleAndAddPoint = applyDoubleAndAddMethod(P, 999n, a, b);
    // console.log('Double and add\n', doubleAndAddPoint.getPoint());

    /*********************************************************************************************** */
    // /** Key exchange - Elliptic Curve Diffie Hellman */
    // /** Private key of Alice */
    // const ka = BigInt('100000000021');
    // /** Private key of Bob */
    // const kb = BigInt('100000000077');
    // let timeStart, timeStop;
    // timeStart = new Date();
    // const alicePublicKey = applyDoubleAndAddMethod(P, ka, a, b);
    // timeStop = new Date();
    // console.log(`Public key generation time: `, timeStop.valueOf() - timeStart.valueOf(), 'ms');
    // const bobPublicKey = applyDoubleAndAddMethod(P, kb, a, b);
    // console.log({
    //     alicePrivateKey: ka,
    //     alicePublicKey: alicePublicKey.getPoint(),
    //     bobPrivateKey: kb,
    //     bobPublicKey: bobPublicKey.getPoint()
    // });
    // timeStart = new Date();
    // const aliceSharedKey = applyDoubleAndAddMethod(bobPublicKey, ka, a, b);
    // timeStop = new Date();
    // console.log(`Shared key generation time: `, timeStop.valueOf() - timeStart.valueOf(), 'ms');
    // const bobSharedKey = applyDoubleAndAddMethod(alicePublicKey, kb, a, b);
    // console.log({
    //     aliceSharedKey: aliceSharedKey.getPoint(),
    //     bobSharedKey: bobSharedKey.getPoint()
    // });

    /*********************************************************************************************** */
    // /** Elliptic Curve Digital Signature Algorithm (ECDSA) */
    // /** Hashing */
    // const text = 'Created by Suthinan Musitmani';
    // const hash = cryptoHash(text);
    // console.log(text, hash);
    // /** Private Key And Public Key */
    // const privateKey = bitcoinConfig.privateKey;
    // const publicKey = applyDoubleAndAddMethod(P, privateKey, a, b);
    // console.log({ privateKey, publicKey: publicKey.getPoint() });
    // /** Random Key And Random Point */
    // const randomKey = bitcoinConfig.randomKey();
    // const randomPoint = applyDoubleAndAddMethod(P, randomKey, a, b);
    // console.log({ randomKey, randomPoint: randomPoint.getPoint() });
    // /** Signature */
    // const r = randomPoint.getPointX() % order;
    // const s = ((hash + (r * privateKey)) * multiplicativeInverse(randomKey, order)) % order;
    // console.log({ r, s });
    // /** Verification */
    // const w = multiplicativeInverse(s, order);
    // const u1 = applyDoubleAndAddMethod(P, ((hash * w) % order), a, b);
    // const u2 = applyDoubleAndAddMethod(publicKey, ((r * w) % order), a, b);
    // const checkPoint = applyPointAddition(u1, u2, a, b);
    // console.log({ checkPoint: checkPoint.getPoint() });
    // if (checkPoint.getPointX() == r) {
    //     console.info('Signature is valid', checkPoint.getPointX(), r);
    // } else {
    //     console.warn('Signature is invalid', checkPoint.getPointX(), r);
    // }

    /*********************************************************************************************** */
    /** Elliptic Curve ElGamal Cryptosystem (Elliptic Curve For Symmetric Encryption And Decryption) */
    /** Choose Sample Point At 1000P As A Plaintext */
    console.log('-------------------- Plaintext --------------------');
    const plaintext = new Point();
    plaintext.setPointX(BigInt('33614996735103061868086131503312627786077049888376966084542785773152043381677'));
    plaintext.setPointY(BigInt('84557594361191031609962062080128931200952163654712344162477769532776951195137'));
    console.log({ plaintext });
    /** Set Secret Key, Which Both Alice And Bob Must Know This Key (Using Bitcoin Private Key As An Example) */
    console.log('-------------------- Secret Key And Public Key --------------------');
    const secretKey = bitcoinConfig.privateKey;
    console.log({ secretKey });
    /** Get Public Key */
    const publicKey = applyDoubleAndAddMethod(P, secretKey, a, b);
    console.log({ publicKey });
    /** Encryption */
    console.log('-------------------- Encryption --------------------');
    const randomKey = bitcoinConfig.randomKey();
    const ciphertext1 = applyDoubleAndAddMethod(P, randomKey, a, b);
    let ciphertext2 = applyDoubleAndAddMethod(publicKey, randomKey, a, b);
    ciphertext2 = applyPointAddition(ciphertext2, plaintext, a, b);
    console.log({ ciphertext1, ciphertext2 });
    /** Decryption */
    console.log('-------------------- Encryption --------------------');
    /** Let secretKeyCiphertext1 = (secretKey * ciphertext1) Point */
    const secretKeyCiphertext1 = applyDoubleAndAddMethod(ciphertext1, secretKey, a, b);
    /** Find The Inverse Of secretKeyCiphertext1 [secretKeyCiphertext1Inv = (secretKeyCiphertext1.x, -1 * secretKeyCiphertext1.y)] */
    const secretKeyCiphertext1Inv = new Point(secretKeyCiphertext1.getPointX(), BigInt(-1) * secretKeyCiphertext1.getPointY());
    /** Get Decrypted Plaintext [plaintext = ciphertext2 + (-secretKey * ciphertext1)] */
    const decrypedPlaintext = applyPointAddition(ciphertext2, secretKeyCiphertext1Inv, a, b);
    console.log({ decrypedPlaintext });
    /** Summary */
    console.log('-------------------- Summary --------------------');
    console.log('plaintext == decrypedPlaintext ? ', plaintext.getPoint() == decrypedPlaintext.getPoint());
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

// function multiplicativeInverse(a = BigInt(0), modulo = globalModulo) {
//     /** Find Multiplicative Inverse [a^-1 modulo p] = c */
//     // b / a = b * [(a^-1) modulo p] = b * c
//     return require('bigint-mod-arith').modInv(a, BigInt(modulo));
// }

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
