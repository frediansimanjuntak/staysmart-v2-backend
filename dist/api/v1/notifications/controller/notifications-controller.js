"use strict";
var notifications_dao_1 = require("../dao/notifications-dao");
var NotificationsController = (function () {
    function NotificationsController() {
    }
    NotificationsController.getAll = function (req, res) {
        notifications_dao_1.default['getAll']()
            .then(function (notifications) { return res.status(200).json(notifications); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    NotificationsController.getById = function (req, res) {
        var _id = req.params.id;
        notifications_dao_1.default['getById'](_id)
            .then(function (notifications) { return res.status(200).json(notifications); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    NotificationsController.createNotifications = function (req, res) {
        var _notifications = req.body;
        notifications_dao_1.default['createNotifications'](_notifications)
            .then(function (notifications) { return res.status(201).json(notifications); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    NotificationsController.deleteNotifications = function (req, res) {
        var _id = req.params.id;
        notifications_dao_1.default['deleteNotifications'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    NotificationsController.updateNotifications = function (req, res) {
        var _id = req.params.id;
        var _type = req.params.type;
        notifications_dao_1.default['updateNotifications'](_id, _type)
            .then(function (notifications) { return res.status(201).json(notifications); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return NotificationsController;
}());
exports.NotificationsController = NotificationsController;
//# sourceMappingURL=notifications-controller.js.map