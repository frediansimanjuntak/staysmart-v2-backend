"use strict";
var appointments_dao_1 = require("../dao/appointments-dao");
var AppointmentsController = (function () {
    function AppointmentsController() {
    }
    AppointmentsController.getAll = function (req, res) {
        appointments_dao_1.default['getAll']()
            .then(function (appointments) { return res.status(200).json(appointments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AppointmentsController.getById = function (req, res) {
        var _id = req.params.id;
        appointments_dao_1.default['getById'](_id)
            .then(function (appointments) { return res.status(200).json(appointments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AppointmentsController.createAppointments = function (req, res) {
        var _appointments = req.body;
        appointments_dao_1.default['createAppointments'](_appointments)
            .then(function (appointments) { return res.status(201).json(appointments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AppointmentsController.deleteAppointments = function (req, res) {
        var _id = req.params.id;
        appointments_dao_1.default['deleteAppointments'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AppointmentsController.updateAppointments = function (req, res) {
        var _id = req.params.id;
        var _appointments = req.body;
        appointments_dao_1.default['updateAppointments'](_id, _appointments)
            .then(function (appointments) { return res.status(201).json(appointments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return AppointmentsController;
}());
exports.AppointmentsController = AppointmentsController;
//# sourceMappingURL=appointments-controller.js.map