"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var properties_model_1 = require("../model/properties-model");
var attachments_dao_1 = require("../../attachments/dao/attachments-dao");
var developments_dao_1 = require("../../developments/dao/developments-dao");
properties_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Properties
            .find(_query)
            .populate("amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company")
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
            .populate("amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company")
            .exec(function (err, properties) {
            err ? reject(err)
                : resolve(properties);
        });
    });
});
properties_model_1.default.static('createProperties', function (properties, front, back) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(properties)) {
            return reject(new TypeError('Property is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = properties;
        var _properties = new Properties(properties);
        _properties.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
        var propertyID = _properties._id;
        var shareholder_data = body.shareholder;
        var idFront = [];
        var idBack = [];
        var front_image = front;
        var back_image = back;
        if (front_image != null) {
            attachments_dao_1.default.createAttachments(front_image).then(function (res) {
                idFront.push(res.idAtt);
            });
        }
        if (back_image != null) {
            attachments_dao_1.default.createAttachments(back_image).then(function (res) {
                idBack.push(res.idAtt);
            });
        }
        Properties
            .findByIdAndUpdate(propertyID, {
            $push: {
                "shareholder.name": shareholder_data.name,
                "shareholder.identification_type": shareholder_data.identification_type,
                "shareholder.identification_number": shareholder_data.identification_number,
                "shareholder.identification_proof.front": idFront,
                "shareholder.identification_proof.back": idBack,
            }
        })
            .exec(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
        developments_dao_1.default
            .findByIdAndUpdate(body.development, {
            $push: {
                "properties": propertyID
            }
        })
            .exec(function (err, saved) {
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
            return reject(new TypeError('Property is not a valid object.'));
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