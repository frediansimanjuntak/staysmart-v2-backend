"use strict";
var faqs_controller_1 = require("../controller/faqs-controller");
var FaqsRoutes = (function () {
    function FaqsRoutes() {
    }
    FaqsRoutes.init = function (router) {
        router
            .route('/api/faqs')
            .get(faqs_controller_1.FaqsController.getAll)
            .post(faqs_controller_1.FaqsController.createFaqs);
        router
            .route('/api/faqs/:id')
            .get(faqs_controller_1.FaqsController.getById)
            .put(faqs_controller_1.FaqsController.deleteFaqs);
        router
            .route('/api/faqs/filter/:filter')
            .get(faqs_controller_1.FaqsController.getByFilter);
        router
            .route('/api/faqs/update/:id')
            .post(faqs_controller_1.FaqsController.updateFaqs);
    };
    return FaqsRoutes;
}());
exports.FaqsRoutes = FaqsRoutes;
//# sourceMappingURL=faqs-routes.js.map