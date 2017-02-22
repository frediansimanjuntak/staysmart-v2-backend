"use strict";
var appointments_controller_1 = require("../controller/appointments-controller");
var auth = require("../../../../auth/auth-service");
var AppointmentsRoutes = (function () {
    function AppointmentsRoutes() {
    }
    AppointmentsRoutes.init = function (router) {
        router
            .route('/appointments')
            .get(auth.isAuthenticated(), appointments_controller_1.AppointmentsController.getAll)
            .post(auth.isAuthenticated(), appointments_controller_1.AppointmentsController.createAppointments);
        router
            .route('/appointments/:id')
            .get(auth.isAuthenticated(), appointments_controller_1.AppointmentsController.getById)
            .put(auth.isAuthenticated(), appointments_controller_1.AppointmentsController.deleteAppointments);
        router
            .route('/appointments/update/:id')
            .post(auth.isAuthenticated(), appointments_controller_1.AppointmentsController.updateAppointments);
    };
    return AppointmentsRoutes;
}());
exports.AppointmentsRoutes = AppointmentsRoutes;
//# sourceMappingURL=appointments-routes.js.map