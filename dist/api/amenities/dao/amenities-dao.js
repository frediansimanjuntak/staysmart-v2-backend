"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var amenities_model_1 = require("../model/amenities-model");
amenities_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Amenities
            .find(_query)
            .exec(function (err, amenities) {
            err ? reject(err)
                : resolve(amenities);
        });
    });
});
amenities_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Amenities
            .findById(id)
            .exec(function (err, amenities) {
            err ? reject(err)
                : resolve(amenities);
        });
    });
});
amenities_model_1.default.static('createAmenities', function (amenities) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(amenities)) {
            return reject(new TypeError('User is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = amenities;
        var _amenities = new Amenities(amenities);
        _amenities.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
amenities_model_1.default.static('deleteAmenities', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Amenities
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
amenities_model_1.default.static('updateAmenities', function (id, amenities) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(amenities)) {
            return reject(new TypeError('Bank is not a valid object.'));
        }
        Amenities
            .findByIdAndUpdate(id, amenities)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Amenities = mongoose.model('Amenities', amenities_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Amenities;
//# sourceMappingURL=amenities-dao.js.map