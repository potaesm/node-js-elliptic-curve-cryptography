const BigDecimal = require('js-big-decimal');

class BigDecimalPoint {
    constructor(pointX = new BigDecimal(0), pointY = new BigDecimal(0)) {
        this.pointX = pointX;
        this.pointY = pointY;
    }
    getPointX() {
        return this.pointX;
    }
    getPointY() {
        return this.pointY;
    }
    setPointX(pointX = new BigDecimal(0)) {
        this.pointX = pointX;
    }
    setPointY(pointY = new BigDecimal(0)) {
        this.pointY = pointY;
    }
    getPoint(precision = 20) {
        return `(${this.pointX.round(precision, 5).getValue()}, ${this.pointY.round(precision, 5).getValue()})`;
    }
}

module.exports = BigDecimalPoint;
