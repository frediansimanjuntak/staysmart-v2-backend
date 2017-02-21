"use strict";
var users_dao_1 = require("../dao/users-dao");
var passport = require('passport');
var UsersController = (function () {
    function UsersController() {
    }
    UsersController.index = function (req, res) {
        users_dao_1.default['index']()
            .then(function (users) { return res.status(200).json(users); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    UsersController.getAll = function (req, res) {
        users_dao_1.default['getAll']()
            .then(function (users) { return res.status(200).json(users); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    UsersController.me = function (req, res) {
        var _userId = req.user._id;
        users_dao_1.default['me'](_userId)
            .then(function (users) { return res.status(200).json(users); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    UsersController.getById = function (req, res) {
        var _id = req.params.id;
        users_dao_1.default['getById'](_id)
            .then(function (users) { return res.status(200).json(users); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    UsersController.createUser = function (req, res) {
        var _user = req.body;
        users_dao_1.default['createUser'](_user)
            .then(function (users) { return res.status(201).json(users); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    UsersController.deleteUser = function (req, res) {
        var _id = req.params.id;
        users_dao_1.default['deleteUser'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    UsersController.updateUser = function (req, res) {
        var _id = req.params.id;
        var _user = req.body;
        users_dao_1.default['updateUser'](_id, _user)
            .then(function (users) { return res.status(201).json(users); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return UsersController;
}());
exports.UsersController = UsersController;
//# sourceMappingURL=users-controller.js.map