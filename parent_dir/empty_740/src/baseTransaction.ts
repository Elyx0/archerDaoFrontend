"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTransaction = void 0;
var common_1 = __importDefault(require("@ethereumjs/common"));
var ethereumjs_util_1 = require("ethereumjs-util");
/**
 * This base class will likely be subject to further
 * refactoring along the introduction of additional tx types
 * on the Ethereum network.
 *
 * It is therefore not recommended to use directly.
 */
var BaseTransaction = /** @class */ (function () {
    function BaseTransaction(txData, txOptions) {
        if (txOptions === void 0) { txOptions = {}; }
        var _a, _b;
        var nonce = txData.nonce, gasLimit = txData.gasLimit, gasPrice = txData.gasPrice, to = txData.to, value = txData.value, data = txData.data, v = txData.v, r = txData.r, s = txData.s;
        var type = txData.type;
        if (type !== undefined) {
            this._type = new ethereumjs_util_1.BN(ethereumjs_util_1.toBuffer(type)).toNumber();
        }
        else {
            this._type = 0;
        }
        var toB = ethereumjs_util_1.toBuffer(to === '' ? '0x' : to);
        var vB = ethereumjs_util_1.toBuffer(v === '' ? '0x' : v);
        var rB = ethereumjs_util_1.toBuffer(r === '' ? '0x' : r);
        var sB = ethereumjs_util_1.toBuffer(s === '' ? '0x' : s);
        this.nonce = new ethereumjs_util_1.BN(ethereumjs_util_1.toBuffer(nonce === '' ? '0x' : nonce));
        this.gasPrice = new ethereumjs_util_1.BN(ethereumjs_util_1.toBuffer(gasPrice === '' ? '0x' : gasPrice));
        this.gasLimit = new ethereumjs_util_1.BN(ethereumjs_util_1.toBuffer(gasLimit === '' ? '0x' : gasLimit));
        this.to = toB.length > 0 ? new ethereumjs_util_1.Address(toB) : undefined;
        this.value = new ethereumjs_util_1.BN(ethereumjs_util_1.toBuffer(value === '' ? '0x' : value));
        this.data = ethereumjs_util_1.toBuffer(data === '' ? '0x' : data);
        this.v = vB.length > 0 ? new ethereumjs_util_1.BN(vB) : undefined;
        this.r = rB.length > 0 ? new ethereumjs_util_1.BN(rB) : undefined;
        this.s = sB.length > 0 ? new ethereumjs_util_1.BN(sB) : undefined;
        this._validateCannotExceedMaxInteger({
            nonce: this.nonce,
            gasPrice: this.gasPrice,
            gasLimit: this.gasLimit,
            value: this.value,
        });
        this.common = (_b = (_a = txOptions.common) === null || _a === void 0 ? void 0 : _a.copy()) !== null && _b !== void 0 ? _b : new common_1.default({ chain: 'mainnet' });
    }
    Object.defineProperty(BaseTransaction.prototype, "transactionType", {
        /**
         * Returns the transaction type
         */
        get: function () {
            return this._type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseTransaction.prototype, "type", {
        /**
         * Alias for `transactionType`
         */
        get: function () {
            return this.transactionType;
        },
        enumerable: false,
        configurable: true
    });
    BaseTransaction.prototype.validate = function (stringError) {
        if (stringError === void 0) { stringError = false; }
        var errors = [];
        if (this.getBaseFee().gt(this.gasLimit)) {
            errors.push("gasLimit is too low. given " + this.gasLimit + ", need at least " + this.getBaseFee());
        }
        if (this.isSigned() && !this.verifySignature()) {
            errors.push('Invalid Signature');
        }
        return stringError ? errors : errors.length === 0;
    };
    /**
     * The minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
     */
    BaseTransaction.prototype.getBaseFee = function () {
        var fee = this.getDataFee().addn(this.common.param('gasPrices', 'tx'));
        if (this.common.gteHardfork('homestead') && this.toCreationAddress()) {
            fee.iaddn(this.common.param('gasPrices', 'txCreation'));
        }
        return fee;
    };
    /**
     * The amount of gas paid for the data in this tx
     */
    BaseTransaction.prototype.getDataFee = function () {
        var txDataZero = this.common.param('gasPrices', 'txDataZero');
        var txDataNonZero = this.common.param('gasPrices', 'txDataNonZero');
        var cost = 0;
        for (var i = 0; i < this.data.length; i++) {
            this.data[i] === 0 ? (cost += txDataZero) : (cost += txDataNonZero);
        }
        return new ethereumjs_util_1.BN(cost);
    };
    /**
     * The up front amount that an account must have for this transaction to be valid
     */
    BaseTransaction.prototype.getUpfrontCost = function () {
        return this.gasLimit.mul(this.gasPrice).add(this.value);
    };
    /**
     * If the tx's `to` is to the creation address
     */
    BaseTransaction.prototype.toCreationAddress = function () {
        return this.to === undefined || this.to.buf.length === 0;
    };
    BaseTransaction.prototype.isSigned = function () {
        var _a = this, v = _a.v, r = _a.r, s = _a.s;
        return !!v && !!r && !!s;
    };
    /**
     * Determines if the signature is valid
     */
    BaseTransaction.prototype.verifySignature = function () {
        try {
            // Main signature verification is done in `getSenderPublicKey()`
            var publicKey = this.getSenderPublicKey();
            return ethereumjs_util_1.unpadBuffer(publicKey).length !== 0;
        }
        catch (e) {
            return false;
        }
    };
    /**
     * Returns the sender's address
     */
    BaseTransaction.prototype.getSenderAddress = function () {
        return new ethereumjs_util_1.Address(ethereumjs_util_1.publicToAddress(this.getSenderPublicKey()));
    };
    /**
     * Signs a tx and returns a new signed tx object
     */
    BaseTransaction.prototype.sign = function (privateKey) {
        if (privateKey.length !== 32) {
            throw new Error('Private key must be 32 bytes in length.');
        }
        var msgHash = this.getMessageToSign(true);
        var _a = ethereumjs_util_1.ecsign(msgHash, privateKey), v = _a.v, r = _a.r, s = _a.s;
        return this._processSignature(v, r, s);
    };
    BaseTransaction.prototype._validateCannotExceedMaxInteger = function (values) {
        var e_1, _a;
        try {
            for (var _b = __values(Object.entries(values)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                if (value === null || value === void 0 ? void 0 : value.gt(ethereumjs_util_1.MAX_INTEGER)) {
                    throw new Error(key + " cannot exceed MAX_INTEGER, given " + value);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return BaseTransaction;
}());
exports.BaseTransaction = BaseTransaction;
//# sourceMappingURL=baseTransaction.js.map