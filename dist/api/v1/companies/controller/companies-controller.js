"use strict";
var companies_dao_1 = require("../dao/companies-dao");
var CompaniesController = (function () {
    function CompaniesController() {
    }
    CompaniesController.getAll = function (req, res) {
        companies_dao_1.default['getAll']()
            .then(function (companies) { return res.status(200).json(companies); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CompaniesController.getById = function (req, res) {
        var _id = req.params.id;
        companies_dao_1.default['getById'](_id)
            .then(function (companies) { return res.status(200).json(companies); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CompaniesController.createCompanies = function (req, res) {
        var _companies = req.body;
        var _attachments = req["files"].attachment;
        companies_dao_1.default['createCompanies'](_companies, _attachments)
            .then(function (companies) { return res.status(201).json(companies); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CompaniesController.deleteCompanies = function (req, res) {
        var _id = req.params.id;
        companies_dao_1.default['deleteCompanies'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CompaniesController.updateCompanies = function (req, res) {
        var _id = req.params.id;
        var _companies = req.body;
        companies_dao_1.default['updateCompanies'](_id, _companies)
            .then(function (companies) { return res.status(201).json(companies); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return CompaniesController;
}());
exports.CompaniesController = CompaniesController;
//# sourceMappingURL=companies-controller.js.map