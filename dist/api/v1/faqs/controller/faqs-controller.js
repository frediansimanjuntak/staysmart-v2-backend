"use strict";
var faqs_dao_1 = require("../dao/faqs-dao");
var FaqsController = (function () {
    function FaqsController() {
    }
    FaqsController.getAll = function (req, res) {
        faqs_dao_1.default['getAll']()
            .then(function (faqs) { return res.status(200).json(faqs); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    FaqsController.getById = function (req, res) {
        var _id = req.params.id;
        faqs_dao_1.default['getById'](_id)
            .then(function (faqs) { return res.status(200).json(faqs); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    FaqsController.getByFilter = function (req, res) {
        var _filter = req.params.filter;
        faqs_dao_1.default['getByFilter'](_filter)
            .then(function (faqs) { return res.status(200).json(faqs); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    FaqsController.createFaqs = function (req, res) {
        var _faqs = req.body;
        faqs_dao_1.default['createFaqs'](_faqs)
            .then(function (faqs) { return res.status(201).json(faqs); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    FaqsController.deleteFaqs = function (req, res) {
        var _id = req.params.id;
        faqs_dao_1.default['deleteFaqs'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    FaqsController.updateFaqs = function (req, res) {
        var _id = req.params.id;
        var _faqs = req.body;
        faqs_dao_1.default['updateFaqs'](_id, _faqs)
            .then(function (faqs) { return res.status(201).json(faqs); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return FaqsController;
}());
exports.FaqsController = FaqsController;
//# sourceMappingURL=faqs-controller.js.map