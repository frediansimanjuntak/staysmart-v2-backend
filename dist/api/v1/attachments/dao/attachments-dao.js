"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var attachments_model_1 = require("../model/attachments-model");
var aws_service_1 = require("../../../../global/aws.service");
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
        var files = [].concat(attachments);
        var idAtt = [];
        if (files.length > 0) {
            var i = 0;
            var attachmentfile = function () {
                var file = files[i];
                var key = 'Staysmart-revamp/attachment/' + file.name;
                aws_service_1.AWSService.upload(key, file).then(function (fileDetails) {
                    var _attachment = new Attachments(attachments);
                    _attachment.name = fileDetails.name;
                    _attachment.type = fileDetails.type;
                    _attachment.key = fileDetails.url;
                    _attachment.size = fileDetails.size;
                    _attachment.save();
                    var idattach = _attachment.id;
                    idAtt.push(idattach);
                    if (i >= files.length - 1) {
                        resolve({ idAtt: idAtt });
                    }
                    else {
                        i++;
                        attachmentfile();
                    }
                });
            };
            attachmentfile();
        }
        else {
            resolve({ message: "success" });
        }
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