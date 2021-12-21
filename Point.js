class Point {
    constructor(pointX = BigInt(0), pointY = BigInt(0)) {
        this.pointX = pointX;
        this.pointY = pointY;
    }
    getPointX() {
        return this.pointX;
    }
    getPointY() {
        return this.pointY;
    }
    setPointX(pointX = BigInt(0)) {
        this.pointX = pointX;
    }
    setPointY(pointY = BigInt(0)) {
        this.pointY = pointY;
    }
    getPoint() {
        return `(${this.pointX.toString()}, ${this.pointY.toString()})`;
    }
}

module.exports = Point;
