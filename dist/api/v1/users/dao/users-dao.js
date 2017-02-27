"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var users_model_1 = require("../model/users-model");
var attachments_dao_1 = require("../../attachments/dao/attachments-dao");
var banks_dao_1 = require("../../banks/dao/banks-dao");
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
users_model_1.default.static('updateUserData', function (id, type, userData, front, back) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id) && !_.isObject(userData)) {
            return reject(new TypeError('User data is not a valid object or id is not a valid string.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var userObj = { $set: {} };
        for (var param in userData) {
            userObj.$set[type + '.data.' + param] = userData[param];
        }
        console.log(userObj);
        Users
            .findById(id, function (err, usersData) {
            var dataRole = usersData + '.' + type;
            if (dataRole != null) {
                console.log('data ada');
            }
        })
            .exec(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
        Users
            .findByIdAndUpdate(id, userObj)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
        if (front) {
            attachments_dao_1.default.createAttachments(front).then(function (res) {
                var idFront = res.idAtt;
                var frontObj = { $set: {} };
                var front_proof = type + '.data.identification_proof.front';
                frontObj.$set[front_proof] = idFront;
                Users
                    .findByIdAndUpdate(id, frontObj)
                    .exec(function (err, saved) {
                    err ? reject(err)
                        : resolve(saved);
                });
            });
        }
        if (back) {
            attachments_dao_1.default.createAttachments(back).then(function (res) {
                var idBack = res.idAtt;
                var backObj = { $set: {} };
                var back_proof = type + '.data.identification_proof.back';
                backObj.$set[back_proof] = idBack;
                Users
                    .findByIdAndUpdate(id, backObj)
                    .exec(function (err, saved) {
                    err ? reject(err)
                        : resolve(saved);
                });
            });
        }
    });
});
users_model_1.default.static('deleteUser', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Users
            .findById(id, function (err, userr) {
            if (userr.tenant.data.bank_account.bank != null) {
                var ObjectID = mongoose.Types.ObjectId;
                var bank_account = userr.tenant.data.bank_account.bank;
                banks_dao_1.default
                    .findByIdAndRemove(bank_account)
                    .exec(function (err, deleted) {
                    err ? reject(err)
                        : resolve();
                });
            }
            if (userr.landlord.data.bank_account.bank != null) {
                var ObjectID = mongoose.Types.ObjectId;
                var bank_account = userr.landlord.data.bank_account.bank;
                banks_dao_1.default
                    .findByIdAndRemove(bank_account)
                    .exec(function (err, deleted) {
                    err ? reject(err)
                        : resolve();
                });
            }
        })
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
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
users_model_1.default.static('activationUser', function (id, code) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Users
            .findByIdAndUpdate(id, {
            $set: {
                "verification.verified": true,
                "verification.verified_date": Date.now(),
                "verification.code": code
            }
        })
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
users_model_1.default.static('unActiveUser', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Users
            .findByIdAndUpdate(id, {
            $set: { "verification.verified": false }
        })
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
var Users = mongoose.model('Users', users_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Users;
//# sourceMappingURL=users-dao.js.map