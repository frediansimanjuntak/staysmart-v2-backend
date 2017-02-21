"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var notifications_model_1 = require("../model/notifications-model");
notifications_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Notifications
            .find(_query)
            .exec(function (err, notifications) {
            err ? reject(err)
                : resolve(notifications);
        });
    });
});
notifications_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Notifications
            .findById(id)
            .exec(function (err, notifications) {
            err ? reject(err)
                : resolve(notifications);
        });
    });
});
notifications_model_1.default.static('createNotifications', function (notifications) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(notifications)) {
            return reject(new TypeError('Notification is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = notifications;
        var _notifications = new Notifications(notifications);
        _notifications.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
notifications_model_1.default.static('deleteNotifications', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Notifications
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
notifications_model_1.default.static('updateNotifications', function (id, notifications) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(notifications)) {
            return reject(new TypeError('Notification is not a valid object.'));
        }
        Notifications
            .findByIdAndUpdate(id, notifications)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Notifications = mongoose.model('Notifications', notifications_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Notifications;
//# sourceMappingURL=notifications-dao.js.map