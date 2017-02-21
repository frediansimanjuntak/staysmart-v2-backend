"use strict";
var payments_controller_1 = require("../controller/payments-controller");
var PaymentRoutes = (function () {
    function PaymentRoutes() {
    }
    PaymentRoutes.init = function (router) {
        router
            .route('/api/payments')
            .get(payments_controller_1.PaymentsController.getAll)
            .post(payments_controller_1.PaymentsController.createPayment);
        router
            .route('/api/payments/:id')
            .get(payments_controller_1.PaymentsController.getById)
            .post(payments_controller_1.PaymentsController.deletePayment);
        router
            .route('/api/payments/update/:id')
            .post(payments_controller_1.PaymentsController.updatePayment);
    };
    return PaymentRoutes;
}());
exports.PaymentRoutes = PaymentRoutes;
//# sourceMappingURL=payments-routes.js.map