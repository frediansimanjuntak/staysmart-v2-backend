"use strict";
var payments_controller_1 = require("../controller/payments-controller");
var PaymentsRoutes = (function () {
    function PaymentsRoutes() {
    }
    PaymentsRoutes.init = function (router) {
        router
            .route('/payments')
            .get(payments_controller_1.PaymentsController.getAll)
            .post(payments_controller_1.PaymentsController.createPayments);
        router
            .route('/payments/:id')
            .get(payments_controller_1.PaymentsController.getById)
            .put(payments_controller_1.PaymentsController.deletePayments);
        router
            .route('/payments/update/:id')
            .post(payments_controller_1.PaymentsController.updatePayments);
    };
    return PaymentsRoutes;
}());
exports.PaymentsRoutes = PaymentsRoutes;
//# sourceMappingURL=payments-routes.js.map