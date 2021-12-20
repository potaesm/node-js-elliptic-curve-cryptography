const Point = require('./Point');

function main() {
    const a = -4;
    const b = 4;
    const P = new Point(-2, -2);

    let newPoint = pointAddition(P, P, a, b);

    for (let i = 0; i < 100; i++) {
        newPoint = pointAddition(newPoint, P, a, b);
    }
}

main();

function pointAddition(P = new Point(), Q = new Point(), a, b) {
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

    console.log(R);

    return R;
}
