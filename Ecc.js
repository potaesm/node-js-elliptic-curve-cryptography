const BigDecimal = require('js-big-decimal');
const Point = require('./Point');

function main() {
    const a = new BigDecimal(-4);
    const b = new BigDecimal(4);
    const P = new Point(new BigDecimal(-2), new BigDecimal(-2));

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
    const ka = new BigDecimal('10000021');
    /** Private key of Bob */
    const kb = new BigDecimal('10000077');
    /** Key exchange - Elliptic Curve Diffie Hellman */
    const alicePublicKey = applyDoubleAndAddMethod(P, ka, a, b);
    const bobPublicKey = applyDoubleAndAddMethod(P, kb, a, b);
    console.log({
        alicePrivateKey: ka.getValue(),
        alicePublicKey: alicePublicKey.getPoint(),
        bobPrivateKey: kb.getValue(),
        bobPublicKey: bobPublicKey.getPoint()
    });
    const aliceSharedKey = applyDoubleAndAddMethod(bobPublicKey, ka, a, b);
    const bobSharedKey = applyDoubleAndAddMethod(alicePublicKey, kb, a, b);
    console.log({
        aliceSharedKey: aliceSharedKey.getPoint(50),
        bobSharedKey: bobSharedKey.getPoint(50)
    });
}

main();

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

function applyDoubleAndAddMethod(P = new Point(), k = new BigDecimal(0), a = new BigDecimal(0), b = new BigDecimal(0), precision = 100) {
    const kAsBinary = dec2bin(k.getValue());
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

function applyPointAddition(P = new Point(), Q = new Point(), a = new BigDecimal(0), b = new BigDecimal(0), precision = 100) {
    const x1 = P.getPointX();
    const y1 = P.getPointY();
    const x2 = Q.getPointX();
    const y2 = Q.getPointY();
    let beta;
    if (x1.compareTo(x2) === 0 && y1.compareTo(y2) === 0) {
        /** Apply doubling */
        beta = ((new BigDecimal(3).multiply(x1).multiply(x1)).add(a)).divide(new BigDecimal(2).multiply(y1), precision);
        // beta = ((3 * x1 * x1) + a) / (2 * y1);
    } else {
        /** Apply point addition */
        beta = (y2.subtract(y1)).divide(x2.subtract(x1), precision);
        // beta = (y2-y1)/(x2-x1)
    }
    const x3 = (beta.multiply(beta)).subtract(x1).subtract(x2);
    const y3 = (beta.multiply(x1.subtract(x3))).subtract(y1);
    // const x3 = (beta * beta) - x1 - x2;
    // const y3 = (beta * (x1 - x3)) - y1;

    const R = new Point(x3, y3);
    return R;
}
