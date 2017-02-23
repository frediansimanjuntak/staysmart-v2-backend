"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var developments_model_1 = require("../model/developments-model");
var properties_dao_1 = require("../../properties/dao/properties-dao");
developments_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Developments
            .find(_query)
            .exec(function (err, developments) {
            err ? reject(err)
                : resolve(developments);
        });
    });
});
developments_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Developments
            .findById(id)
            .exec(function (err, developments) {
            err ? reject(err)
                : resolve(developments);
        });
    });
});
developments_model_1.default.static('createDevelopments', function (developments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(developments)) {
            return reject(new TypeError('Development is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = developments;
        var _developments = new Developments(developments);
        _developments.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
developments_model_1.default.static('deleteDevelopments', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Developments
            .findById(id, function (err, developments) {
            if (developments.properties != null) {
                var ObjectID = mongoose.Types.ObjectId;
                var developments_properties = [].concat(developments.properties);
                for (var i = 0; i < developments_properties.length; i++) {
                    var properties = developments_properties[i];
                    properties_dao_1.default
                        .findByIdAndRemove(properties)
                        .exec(function (err, deleted) {
                        err ? reject(err)
                            : resolve(deleted);
                    });
                }
            }
        })
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve(deleted);
        });
        Developments
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
developments_model_1.default.static('updateDevelopments', function (id, developments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(developments)) {
            return reject(new TypeError('Development is not a valid object.'));
        }
        Developments
            .findByIdAndUpdate(id, developments)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Developments = mongoose.model('Developments', developments_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Developments;
//# sourceMappingURL=developments-dao.js.map