"use strict";
var banks_dao_1 = require("../dao/banks-dao");
var BanksController = (function () {
    function BanksController() {
    }
    BanksController.getAll = function (req, res) {
        banks_dao_1.default['getAll']()
            .then(function (banks) { return res.status(200).json(banks); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BanksController.getById = function (req, res) {
        var _id = req.params.id;
        banks_dao_1.default['getById'](_id)
            .then(function (banks) { return res.status(200).json(banks); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BanksController.createBanks = function (req, res) {
        var _banks = req.body;
        banks_dao_1.default['createBanks'](_banks)
            .then(function (banks) { return res.status(201).json(banks); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BanksController.deleteBanks = function (req, res) {
        var _id = req.params.id;
        banks_dao_1.default['deleteBanks'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BanksController.updateBanks = function (req, res) {
        var _id = req.params.id;
        var _banks = req.body;
        banks_dao_1.default['updateBanks'](_id, _banks)
            .then(function (banks) { return res.status(201).json(banks); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return BanksController;
}());
exports.BanksController = BanksController;
//# sourceMappingURL=banks-controller.js.map