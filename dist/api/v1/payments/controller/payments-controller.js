"use strict";
var payments_dao_1 = require("../dao/payments-dao");
var PaymentsController = (function () {
    function PaymentsController() {
    }
    PaymentsController.getAll = function (req, res) {
        payments_dao_1.default['getAll']()
            .then(function (payments) { return res.status(200).json(payments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PaymentsController.getById = function (req, res) {
        var _id = req.params.id;
        payments_dao_1.default['getById'](_id)
            .then(function (payments) { return res.status(200).json(payments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PaymentsController.createPayments = function (req, res) {
        var _payments = req.body;
        payments_dao_1.default['createPayments'](_payments)
            .then(function (payments) { return res.status(201).json(payments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PaymentsController.deletePayments = function (req, res) {
        var _id = req.params.id;
        payments_dao_1.default['deletePayments'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PaymentsController.updatePayments = function (req, res) {
        var _id = req.params.id;
        var _payments = req.body;
        payments_dao_1.default['updatePayments'](_id, _payments)
            .then(function (payments) { return res.status(201).json(payments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return PaymentsController;
}());
exports.PaymentsController = PaymentsController;
//# sourceMappingURL=payments-controller.js.map