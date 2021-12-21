const Point = require("./Point");

/** Curve y^2 = x^3 + ax + b = x^3 + 7 */
const a = BigInt(0);
const b = BigInt(7);

/** Modulo */
function generatePrimeModulo() {
    // secp256k1
    // 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 1
    return (2n ** 256n) - (2n ** 32n) - (2n ** 9n) - (2n ** 8n) - (2n ** 7n) - (2n ** 6n) - (2n ** 4n) - 1n;
}
const modulo = generatePrimeModulo();
const order = BigInt('0x' + 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');

/** Base Point */
const basePoint = new Point();
basePoint.setPointX(BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'));
basePoint.setPointY(BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'));

/** Sample Private Key */
const privateKey = BigInt('75263518707598184987916378021939673586055614731957507592904438851787542395619');
const randomKey = require('random-bigint')(256);
// const randomKey = BigInt('28695618543805844332113829720373285210420739438570883203839696518176414791234');

module.exports = {
    a,
    b,
    modulo,
    order,
    basePoint,
    privateKey,
    randomKey
};
