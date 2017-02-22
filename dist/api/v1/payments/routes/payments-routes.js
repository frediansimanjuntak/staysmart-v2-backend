"use strict";
var payments_controller_1 = require("../controller/payments-controller");
var auth = require("../../../../auth/auth-service");
var PaymentsRoutes = (function () {
    function PaymentsRoutes() {
    }
    PaymentsRoutes.init = function (router) {
        router
            .route('/payments')
            .get(auth.isAuthenticated(), payments_controller_1.PaymentsController.getAll)
            .post(auth.isAuthenticated(), payments_controller_1.PaymentsController.createPayments);
        router
            .route('/payments/:id')
            .get(auth.isAuthenticated(), payments_controller_1.PaymentsController.getById)
            .put(auth.isAuthenticated(), payments_controller_1.PaymentsController.deletePayments);
        router
            .route('/payments/update/:id')
            .post(auth.isAuthenticated(), payments_controller_1.PaymentsController.updatePayments);
    };
    return PaymentsRoutes;
}());
exports.PaymentsRoutes = PaymentsRoutes;
//# sourceMappingURL=payments-routes.js.map