"use strict";
var appointments_controller_1 = require("../controller/appointments-controller");
var AppointmentsRoutes = (function () {
    function AppointmentsRoutes() {
    }
    AppointmentsRoutes.init = function (router) {
        router
            .route('/appointments')
            .get(appointments_controller_1.AppointmentsController.getAll)
            .post(appointments_controller_1.AppointmentsController.createAppointments);
        router
            .route('/appointments/:id')
            .get(appointments_controller_1.AppointmentsController.getById)
            .put(appointments_controller_1.AppointmentsController.deleteAppointments);
        router
            .route('/appointments/update/:id')
            .post(appointments_controller_1.AppointmentsController.updateAppointments);
    };
    return AppointmentsRoutes;
}());
exports.AppointmentsRoutes = AppointmentsRoutes;
//# sourceMappingURL=appointments-routes.js.map