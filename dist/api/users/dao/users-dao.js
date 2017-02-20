"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var users_model_1 = require("../model/users-model");
// import Agreements from '../../agreements/dao/agreements-dao'
// import Attachments from '../../attachments/dao/attachments-dao'
// import Banks from '../../banks/dao/banks-dao'
// import Companies from '../../companies/dao/companies-dao'
// import Properties from '../../properties/dao/properties-dao'
users_model_1.default.static('index', function () {
    return new Promise(function (resolve, reject) {
        Users
            .find({}, '-salt -password')
            .exec(function (err, users) {
            err ? reject(err)
                : resolve(users);
        });
    });
});
users_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Users
            .find(_query)
            .exec(function (err, users) {
            err ? reject(err)
                : resolve(users);
        });
    });
});
users_model_1.default.static('me', function (userId) {
    return new Promise(function (resolve, reject) {
        Users
            .findOne({ _id: userId }, '-salt -password')
            .populate("agreements attachments banks companies properties")
            .exec(function (err, users) {
            err ? reject(err)
                : resolve(users);
        });
    });
});
users_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Users
            .findById(id, '-salt -password')
            .populate("agreements attachments banks companies properties")
            .exec(function (err, users) {
            err ? reject(err)
                : resolve(users);
        });
    });
});
users_model_1.default.static('createUser', function (user) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(user)) {
            return reject(new TypeError('User is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = user;
        var _user = new Users(user);
        _user.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
users_model_1.default.static('deleteUser', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Users
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
users_model_1.default.static('updateUser', function (id, user) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(user)) {
            return reject(new TypeError('User is not a valid object.'));
        }
        Users
            .findByIdAndUpdate(id, user)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Users = mongoose.model('Users', users_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Users;
//# sourceMappingURL=users-dao.js.map