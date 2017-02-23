"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var agreements_model_1 = require("../model/agreements-model");
agreements_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Agreements
            .find(_query)
            .exec(function (err, agreements) {
            err ? reject(err)
                : resolve(agreements);
        });
    });
});
agreements_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Agreements
            .findById(id)
            .exec(function (err, agreements) {
            err ? reject(err)
                : resolve(agreements);
        });
    });
});
agreements_model_1.default.static('createAgreements', function (agreements) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(agreements)) {
            return reject(new TypeError('Agreement is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = agreements;
        var _agreements = new Agreements(agreements);
        _agreements.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
agreements_model_1.default.static('updateAgreementsData', function (id, type, data) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(data)) {
            return reject(new TypeError('LOI is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        if (type != 'inventory') {
            var agreementObj = { $set: {} };
            for (var param in data) {
                agreementObj.$set[type + '.data.' + param] = data[param];
            }
            Agreements
                .findByIdAndUpdate(id, agreementObj)
                .exec(function (err, updated) {
                err ? reject(err)
                    : resolve();
            });
        }
        else {
        }
    });
});
agreements_model_1.default.static('deleteAgreements', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Agreements
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
agreements_model_1.default.static('updateAgreements', function (id, agreements) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(agreements)) {
            return reject(new TypeError('Agreement is not a valid object.'));
        }
        Agreements
            .findByIdAndUpdate(id, agreements)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Agreements = mongoose.model('Agreements', agreements_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Agreements;
//# sourceMappingURL=agreements-dao.js.map