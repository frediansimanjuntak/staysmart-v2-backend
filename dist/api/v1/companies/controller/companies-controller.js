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
        var _documents = req["files"].document;
        var _created_by = req["user"]._id;
        companies_dao_1.default['createCompanies'](_companies, _documents, _created_by)
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
    CompaniesController.createDocument = function (req, res) {
        var _id = req.params.id;
        var _documents = req["files"].document;
        companies_dao_1.default['createDocument'](_id, _documents)
            .then(function (companies) { return res.status(201).json(companies); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CompaniesController.deleteDocument = function (req, res) {
        var _id = req.params.id;
        var _documentId = req.params.documentId;
        companies_dao_1.default['createDocument'](_id, _documentId)
            .then(function (companies) { return res.status(201).json(companies); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return CompaniesController;
}());
exports.CompaniesController = CompaniesController;
//# sourceMappingURL=companies-controller.js.map