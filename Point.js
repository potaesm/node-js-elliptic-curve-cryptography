class Point {
    constructor(pointX = 0, pointY = 0) {
        this.pointX = pointX;
        this.pointY = pointY;
    }
    getPointX() {
        return this.pointX;
    }
    getPointY() {
        return this.pointY;
    }
    setPointX(pointX) {
        this.pointX = pointX;
    }
    setPointY(pointY) {
        this.pointY = pointY;
    }
}

module.exports = Point;
