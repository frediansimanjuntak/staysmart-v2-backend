"use strict";
var faqs_controller_1 = require("../controller/faqs-controller");
var auth = require("../../../../auth/auth-service");
var FaqsRoutes = (function () {
    function FaqsRoutes() {
    }
    FaqsRoutes.init = function (router) {
        router
            .route('/faqs')
            .get(auth.isAuthenticated(), faqs_controller_1.FaqsController.getAll)
            .post(auth.isAuthenticated(), faqs_controller_1.FaqsController.createFaqs);
        router
            .route('/faqs/:id')
            .get(auth.isAuthenticated(), faqs_controller_1.FaqsController.getById)
            .put(auth.isAuthenticated(), faqs_controller_1.FaqsController.deleteFaqs);
        router
            .route('/faqs/filter/:filter')
            .get(auth.isAuthenticated(), faqs_controller_1.FaqsController.getByFilter);
        router
            .route('/faqs/update/:id')
            .post(auth.isAuthenticated(), faqs_controller_1.FaqsController.updateFaqs);
    };
    return FaqsRoutes;
}());
exports.FaqsRoutes = FaqsRoutes;
//# sourceMappingURL=faqs-routes.js.map