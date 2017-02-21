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
    PaymentsController.createPayment = function (req, res) {
        var _payment = req.body;
        payments_dao_1.default['createPayment'](_payment)
            .then(function (payment) { return res.status(201).json(payment); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PaymentsController.deletePayment = function (req, res) {
        var _id = req.params.id;
        payments_dao_1.default['deletePayment'](_id)
            .then(function () { return res.status(200).json(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PaymentsController.updatePayment = function (req, res) {
        var _id = req.params.id;
        var _payment = req.body;
        payments_dao_1.default['updatePayment'](_id, _payment)
            .then(function (payment) { return res.status(201).json(payment); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return PaymentsController;
}());
exports.PaymentsController = PaymentsController;
//# sourceMappingURL=payments-controller.js.map