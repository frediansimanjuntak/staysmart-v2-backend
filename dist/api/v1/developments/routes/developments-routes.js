"use strict";
var developments_controller_1 = require("../controller/developments-controller");
var auth = require("../../../../auth/auth-service");
var DevelopmentsRoutes = (function () {
    function DevelopmentsRoutes() {
    }
    DevelopmentsRoutes.init = function (router) {
        router
            .route('/developments')
            .get(auth.isAuthenticated(), developments_controller_1.DevelopmentsController.getAll)
            .post(auth.isAuthenticated(), developments_controller_1.DevelopmentsController.createDevelopments);
        router
            .route('/developments/:id')
            .get(auth.isAuthenticated(), developments_controller_1.DevelopmentsController.getById)
            .put(auth.isAuthenticated(), developments_controller_1.DevelopmentsController.deleteDevelopments);
        router
            .route('/developments/update/:id')
            .post(auth.isAuthenticated(), developments_controller_1.DevelopmentsController.updateDevelopments);
    };
    return DevelopmentsRoutes;
}());
exports.DevelopmentsRoutes = DevelopmentsRoutes;
//# sourceMappingURL=developments-routes.js.map