"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var attachments_model_1 = require("../model/attachments-model");
attachments_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Attachments
            .find(_query)
            .exec(function (err, attachments) {
            err ? reject(err)
                : resolve(attachments);
        });
    });
});
attachments_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Attachments
            .findById(id)
            .exec(function (err, attachments) {
            err ? reject(err)
                : resolve(attachments);
        });
    });
});
attachments_model_1.default.static('createAttachments', function (attachments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(attachments)) {
            return reject(new TypeError('Attachment is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = attachments;
        var _attachments = new Attachments(attachments);
        _attachments.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
attachments_model_1.default.static('deleteAttachments', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Attachments
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
attachments_model_1.default.static('updateAttachments', function (id, attachments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(attachments)) {
            return reject(new TypeError('Attachment is not a valid object.'));
        }
        Attachments
            .findByIdAndUpdate(id, attachments)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Attachments = mongoose.model('Attachments', attachments_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Attachments;
//# sourceMappingURL=attachments-dao.js.map