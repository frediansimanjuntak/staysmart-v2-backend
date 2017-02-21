"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var banks_model_1 = require("../model/banks-model");
banks_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Banks
            .find(_query)
            .exec(function (err, banks) {
            err ? reject(err)
                : resolve(banks);
        });
    });
});
banks_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Banks
            .findById(id)
            .exec(function (err, banks) {
            err ? reject(err)
                : resolve(banks);
        });
    });
});
banks_model_1.default.static('createBanks', function (banks) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(banks)) {
            return reject(new TypeError('User is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = banks;
        var _banks = new Banks(banks);
        _banks.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
banks_model_1.default.static('deleteBanks', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Banks
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
banks_model_1.default.static('updateBanks', function (id, banks) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(banks)) {
            return reject(new TypeError('Bank is not a valid object.'));
        }
        Banks
            .findByIdAndUpdate(id, banks)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Banks = mongoose.model('Banks', banks_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Banks;
//# sourceMappingURL=banks-dao.js.map