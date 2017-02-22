"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var payments_model_1 = require("../model/payments-model");
payments_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Payments
            .find(_query)
            .exec(function (err, payments) {
            err ? reject(err)
                : resolve(payments);
        });
    });
});
payments_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Payments
            .findById(id)
            .exec(function (err, payments) {
            err ? reject(err)
                : resolve(payments);
        });
    });
});
payments_model_1.default.static('createPayments', function (payments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(payments)) {
            return reject(new TypeError('Payment is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = payments;
        var _payments = new Payments(payments);
        _payments.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
payments_model_1.default.static('deletePayments', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Payments
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
payments_model_1.default.static('updatePayments', function (id, payments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(payments)) {
            return reject(new TypeError('Payment is not a valid object.'));
        }
        Payments
            .findByIdAndUpdate(id, payments)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Payments = mongoose.model('Payments', payments_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Payments;
//# sourceMappingURL=payments-dao.js.map