"use strict";
var developments_dao_1 = require("../dao/developments-dao");
var DevelopmentsController = (function () {
    function DevelopmentsController() {
    }
    DevelopmentsController.getAll = function (req, res) {
        developments_dao_1.default['getAll']()
            .then(function (developments) { return res.status(200).json(developments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    DevelopmentsController.getById = function (req, res) {
        var _id = req.params.id;
        developments_dao_1.default['getById'](_id)
            .then(function (developments) { return res.status(200).json(developments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    DevelopmentsController.createDevelopments = function (req, res) {
        var _developments = req.body;
        developments_dao_1.default['createDevelopments'](_developments)
            .then(function (developments) { return res.status(201).json(developments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    DevelopmentsController.deleteDevelopments = function (req, res) {
        var _id = req.params.id;
        developments_dao_1.default['deleteDevelopments'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    DevelopmentsController.updateDevelopments = function (req, res) {
        var _id = req.params.id;
        var _developments = req.body;
        developments_dao_1.default['updateDevelopments'](_id, _developments)
            .then(function (developments) { return res.status(201).json(developments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return DevelopmentsController;
}());
exports.DevelopmentsController = DevelopmentsController;
//# sourceMappingURL=developments-controller.js.map