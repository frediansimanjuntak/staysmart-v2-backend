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
properties_model_1.default.static('createProperties', function (properties) {
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
properties_model_1.default.static('createPropertyPictures', function (propertyID, living, dining, bed, toilet, kitchen) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(propertyID)) {
            return reject(new TypeError('Property ID is not a valid string.'));
        }
        if (!_.isObject(living)) {
            return reject(new TypeError('Living is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        attachments_dao_1.default.createAttachments(living).then(function (res) {
            var idLiving = res.idAtt;
            for (var i = 0; i < idLiving.length; i++) {
                Properties
                    .update({ "_id": propertyID }, {
                    $push: {
                        "pictures.living": idLiving[i]
                    }
                })
                    .exec(function (err, saved) {
                    err ? reject(err)
                        : resolve(saved);
                });
            }
        });
        attachments_dao_1.default.createAttachments(dining).then(function (res) {
            var idDining = res.idAtt;
            for (var i = 0; i < idDining.length; i++) {
                Properties
                    .update({ "_id": propertyID }, {
                    $push: {
                        "pictures.dining": idDining[i]
                    }
                })
                    .exec(function (err, saved) {
                    err ? reject(err)
                        : resolve(saved);
                });
            }
        });
        attachments_dao_1.default.createAttachments(bed).then(function (res) {
            var idBed = res.idAtt;
            for (var i = 0; i < idBed.length; i++) {
                Properties
                    .update({ "_id": propertyID }, {
                    $push: {
                        "pictures.bed": idBed[i]
                    }
                })
                    .exec(function (err, saved) {
                    err ? reject(err)
                        : resolve(saved);
                });
            }
        });
        attachments_dao_1.default.createAttachments(toilet).then(function (res) {
            var idToilet = res.idAtt;
            for (var i = 0; i < idToilet.length; i++) {
                Properties
                    .update({ "_id": propertyID }, {
                    $push: {
                        "pictures.toilet": idToilet[i]
                    }
                })
                    .exec(function (err, saved) {
                    err ? reject(err)
                        : resolve(saved);
                });
            }
        });
        attachments_dao_1.default.createAttachments(kitchen).then(function (res) {
            var idKitchen = res.idAtt;
            for (var i = 0; i < idKitchen.length; i++) {
                Properties
                    .update({ "_id": propertyID }, {
                    $push: {
                        "pictures.kitchen": idKitchen[i]
                    }
                })
                    .exec(function (err, saved) {
                    err ? reject(err)
                        : resolve(saved);
                });
            }
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
properties_model_1.default.static('deletePropertyPictures', function (id, type, pictureID) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        var field = "pictures." + type;
        var picObj = { $pull: {} };
        picObj.$pull[field] = pictureID;
        Properties
            .findByIdAndUpdate(id, picObj)
            .exec(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
        attachments_dao_1.default
            .findByIdAndRemove(pictureID)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve(deleted);
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