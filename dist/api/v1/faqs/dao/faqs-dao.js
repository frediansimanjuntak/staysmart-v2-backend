"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var faqs_model_1 = require("../model/faqs-model");
faqs_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Faqs
            .find(_query)
            .exec(function (err, faqs) {
            err ? reject(err)
                : resolve(faqs);
        });
    });
});
faqs_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Faqs
            .findById(id)
            .exec(function (err, faqs) {
            err ? reject(err)
                : resolve(faqs);
        });
    });
});
faqs_model_1.default.static('getByFilter', function (filter) {
    return new Promise(function (resolve, reject) {
        Faqs
            .find({ 'for': filter })
            .exec(function (err, faqs) {
            err ? reject(err)
                : resolve(faqs);
        });
    });
});
faqs_model_1.default.static('createFaqs', function (faqs, created_by) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(faqs)) {
            return reject(new TypeError('FAQ is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = faqs;
        var _faqs = new Faqs(faqs);
        _faqs.created_by = created_by;
        _faqs.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
faqs_model_1.default.static('deleteFaqs', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Faqs
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
faqs_model_1.default.static('updateFaqs', function (id, faqs) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(faqs)) {
            return reject(new TypeError('FAQ is not a valid object.'));
        }
        Faqs
            .findByIdAndUpdate(id, faqs)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Faqs = mongoose.model('Faqs', faqs_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Faqs;
//# sourceMappingURL=faqs-dao.js.map