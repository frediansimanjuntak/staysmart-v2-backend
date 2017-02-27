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
properties_model_1.default.static('createProperty', function (properties) {
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
properties_model_1.default.static('updateDetails', function (details, id) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(details)) {
            return reject(new TypeError('Detail is not a valid object'));
        }
        var objectID = mongoose.Types.ObjectId;
        var body = details;
        Properties
            .findByIdAndUpdate(id, {
            $set: {
                "details.size_sqf": body.size_sqf,
                "details.size_sqm": body.size_sqm,
                "details.bedroom": body.bedroom,
                "details.bathroom": body.bathroom,
                "details.price": body.price,
                "details.psqft": body.psqft,
                "details.price_psm": body.price_psm,
                "details.price_psf": body.price_psf,
                "details.available": body.available,
                "details.furnishing": body.furnishing,
                "details.description": body.description,
                "details.type": body.type,
                "details.sale_date": body.sale_date,
                "details.property_type": body.property_type,
                "details.tenure": body.tenure,
                "details.completion_date": body.completion_date,
                "details.type_of_sale": body.type_of_sale,
                "details.purchaser_address_indicator": body.purchaser_address_indicator,
                "details.planning_region": body.planning_region,
                "details.planning_area": body.planning_area
            }
        })
            .exec(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
properties_model_1.default.static('deleteDetails', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Properties
            .findByIdAndRemmove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve(deleted);
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
properties_model_1.default.static('updatePropertySchedules', function (id, schedules) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        var schedule = [].concat(schedules);
        for (var i = 0; i < schedule.length; i++) {
            var data = schedule[i];
            Properties
                .findByIdAndUpdate(id, {
                $push: {
                    "schedules": {
                        "day": data.day,
                        "start_date": data.start_date,
                        "time_from": data.time_from,
                        "time_to": data.time_to
                    }
                }
            })
                .exec(function (err, updated) {
                err ? reject(err)
                    : resolve(updated);
            });
        }
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
properties_model_1.default.static('deletePropertySchedules', function (id, idSchedule) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Properties
            .findByIdAndUpdate(id, {
            $pull: {
                "schedules": {
                    "_id": idSchedule
                }
            }
        })
            .exec(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
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