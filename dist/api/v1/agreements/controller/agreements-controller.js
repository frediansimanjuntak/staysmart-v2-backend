"use strict";
var agreements_dao_1 = require("../dao/agreements-dao");
var AgreementsController = (function () {
    function AgreementsController() {
    }
    AgreementsController.getAll = function (req, res) {
        agreements_dao_1.default['getAll']()
            .then(function (agreements) { return res.status(200).json(agreements); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AgreementsController.getById = function (req, res) {
        var _id = req.params.id;
        agreements_dao_1.default['getById'](_id)
            .then(function (agreements) { return res.status(200).json(agreements); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AgreementsController.createAgreements = function (req, res) {
        var _agreements = req.body;
        agreements_dao_1.default['createAgreements'](_agreements)
            .then(function (agreements) { return res.status(201).json(agreements); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AgreementsController.updateAgreementsData = function (req, res) {
        var _data = req.body;
        var _id = req.params.id;
        var _type = req.params.type;
        console.log(_data);
        agreements_dao_1.default['updateAgreementsData'](_id, _type, _data)
            .then(function (agreements) { return res.status(201).json(agreements); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AgreementsController.deleteAgreements = function (req, res) {
        var _id = req.params.id;
        agreements_dao_1.default['deleteAgreements'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AgreementsController.updateAgreements = function (req, res) {
        var _id = req.params.id;
        var _agreements = req.body;
        agreements_dao_1.default['updateAgreements'](_id, _agreements)
            .then(function (agreements) { return res.status(201).json(agreements); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return AgreementsController;
}());
exports.AgreementsController = AgreementsController;
//# sourceMappingURL=agreements-controller.js.map