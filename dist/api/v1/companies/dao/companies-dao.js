"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var companies_model_1 = require("../model/companies-model");
var attachments_dao_1 = require("../../attachments/dao/attachments-dao");
var users_dao_1 = require("../../users/dao/users-dao");
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
companies_model_1.default.static('createCompanies', function (companies, documents, created_by) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(companies)) {
            return reject(new TypeError('Company is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = companies;
        var _companies = new Companies(companies);
        _companies.created_by = created_by;
        _companies.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
        var companiesId = _companies._id;
        attachments_dao_1.default.createAttachments(documents).then(function (res) {
            var idAttachment = res.idAtt;
            for (var i = 0; i < idAttachment.length; i++) {
                console.log(idAttachment[i]);
                Companies
                    .findByIdAndUpdate(companiesId, {
                    $push: {
                        "document": idAttachment[i]
                    }
                })
                    .exec(function (err, update) {
                    err ? reject(err)
                        : resolve(update);
                });
            }
        });
        users_dao_1.default
            .findByIdAndUpdate(created_by, {
            $push: {
                "companies": companiesId
            }
        })
            .exec(function (err, update) {
            err ? reject(err)
                : resolve(update);
        });
    });
});
companies_model_1.default.static('deleteCompanies', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Companies
            .findById(id, function (err, companies) {
            if (companies.document != null) {
                var ObjectID = mongoose.Types.ObjectId;
                var companies_document = [].concat(companies.document);
                for (var i = 0; i < companies_document.length; i++) {
                    var document_1 = companies_document[i];
                    attachments_dao_1.default
                        .findByIdAndRemove(document_1)
                        .exec(function (err, deleted) {
                        err ? reject(err)
                            : resolve(deleted);
                    });
                }
            }
            users_dao_1.default
                .findByIdAndUpdate(companies.created_by, {
                $pull: {
                    "companies": id
                }
            })
                .exec(function (err, deleted) {
                err ? reject(err)
                    : resolve(deleted);
            });
        });
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
companies_model_1.default.static('createDocument', function (id, documents) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(document)) {
            return reject(new TypeError('Document is not a valid object.'));
        }
        attachments_dao_1.default.createAttachments(documents).then(function (res) {
            var idAttachment = res.idAtt;
            console.log(idAttachment);
            for (var i = 0; i < idAttachment.length; i++) {
                console.log(idAttachment[i]);
                Companies
                    .findById({ id: id,
                    $push: { "document": idAttachment[i] }
                })
                    .exec(function (err, saved) {
                    err ? reject(err)
                        : resolve(saved);
                });
            }
        });
    });
});
companies_model_1.default.static('deleteDocument', function (id, documentId) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(document)) {
            return reject(new TypeError('Document is not a valid object.'));
        }
        Companies
            .findByIdAndUpdate(id, {
            $pull: { "document": documentId }
        })
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve(deleted);
        });
        attachments_dao_1.default
            .findByIdAndRemove(documentId)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve(deleted);
        });
    });
});
var Companies = mongoose.model('Companies', companies_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Companies;
//# sourceMappingURL=companies-dao.js.map