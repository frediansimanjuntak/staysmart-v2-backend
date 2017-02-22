"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var appointments_model_1 = require("../model/appointments-model");
// import Schedules from '../../schedules/dao/schedules-dao'
appointments_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Appointments
            .find(_query)
            .populate("landlord tenant property schedule")
            .exec(function (err, appointments) {
            err ? reject(err)
                : resolve(appointments);
        });
    });
});
appointments_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Appointments
            .findById(id)
            .populate("landlord tenant property schedule")
            .exec(function (err, appointments) {
            err ? reject(err)
                : resolve(appointments);
        });
    });
});
appointments_model_1.default.static('createAppointments', function (appointments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(appointments)) {
            return reject(new TypeError('Appointment is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = appointments;
        var _appointments = new Appointments(appointments);
        _appointments.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
appointments_model_1.default.static('deleteAppointments', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Appointments
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
appointments_model_1.default.static('updateAppointments', function (id, appointments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(appointments)) {
            return reject(new TypeError('Appointment is not a valid object.'));
        }
        Appointments
            .findByIdAndUpdate(id, appointments)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Appointments = mongoose.model('Appointments', appointments_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Appointments;
//# sourceMappingURL=appointments-dao.js.map