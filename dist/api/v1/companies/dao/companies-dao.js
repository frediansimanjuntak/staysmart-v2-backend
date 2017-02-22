"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var companies_model_1 = require("../model/companies-model");
companies_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Companies
            .find(_query)
            .exec(function (err, companies) {
            err ? reject(err)
                : resolve(companies);
        });
    });
});
companies_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Companies
            .findById(id)
            .exec(function (err, companies) {
            err ? reject(err)
                : resolve(companies);
        });
    });
});
companies_model_1.default.static('createCompanies', function (companies) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(companies)) {
            return reject(new TypeError('Company is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = companies;
        var _companies = new Companies(companies);
        _companies.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
companies_model_1.default.static('deleteCompanies', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Companies
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
companies_model_1.default.static('updateCompanies', function (id, companies) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(companies)) {
            return reject(new TypeError('Company is not a valid object.'));
        }
        Companies
            .findByIdAndUpdate(id, companies)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Companies = mongoose.model('Companies', companies_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Companies;
//# sourceMappingURL=companies-dao.js.map