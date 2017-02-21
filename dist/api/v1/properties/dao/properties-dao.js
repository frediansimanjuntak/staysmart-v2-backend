"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var properties_model_1 = require("../model/properties-model");
properties_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Properties
            .find(_query)
            .exec(function (err, properties) {
            err ? reject(err)
                : resolve(properties);
        });
    });
});
properties_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Properties
            .findById(id)
            .exec(function (err, properties) {
            err ? reject(err)
                : resolve(properties);
        });
    });
});
properties_model_1.default.static('createProperties', function (properties) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(properties)) {
            return reject(new TypeError('User is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = properties;
        var _properties = new Properties(properties);
        _properties.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
properties_model_1.default.static('deleteProperties', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Properties
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
properties_model_1.default.static('updateProperties', function (id, properties) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(properties)) {
            return reject(new TypeError('Bank is not a valid object.'));
        }
        Properties
            .findByIdAndUpdate(id, properties)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Properties = mongoose.model('Properties', properties_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Properties;
//# sourceMappingURL=properties-dao.js.map