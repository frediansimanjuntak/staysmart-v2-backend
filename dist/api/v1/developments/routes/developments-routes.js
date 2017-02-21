"use strict";
var developments_controller_1 = require("../controller/developments-controller");
var DevelopmentsRoutes = (function () {
    function DevelopmentsRoutes() {
    }
    DevelopmentsRoutes.init = function (router) {
        router
            .route('/developments')
            .get(developments_controller_1.DevelopmentsController.getAll)
            .post(developments_controller_1.DevelopmentsController.createDevelopments);
        router
            .route('/developments/:id')
            .get(developments_controller_1.DevelopmentsController.getById)
            .put(developments_controller_1.DevelopmentsController.deleteDevelopments);
        router
            .route('/developments/update/:id')
            .post(developments_controller_1.DevelopmentsController.updateDevelopments);
    };
    return DevelopmentsRoutes;
}());
exports.DevelopmentsRoutes = DevelopmentsRoutes;
//# sourceMappingURL=developments-routes.js.map