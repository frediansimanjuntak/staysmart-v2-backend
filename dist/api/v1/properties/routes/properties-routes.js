"use strict";
var properties_controller_1 = require("../controller/properties-controller");
var auth = require("../../../../auth/auth-service");
var PropertiesRoutes = (function () {
    function PropertiesRoutes() {
    }
    PropertiesRoutes.init = function (router) {
        router
            .route('/properties')
            .get(auth.isAuthenticated(), properties_controller_1.PropertiesController.getAll)
            .post(auth.isAuthenticated(), properties_controller_1.PropertiesController.createProperties);
        router
            .route('/properties/:id')
            .get(auth.isAuthenticated(), properties_controller_1.PropertiesController.getById)
            .put(auth.isAuthenticated(), properties_controller_1.PropertiesController.deleteProperties);
        router
            .route('/properties/update/:id')
            .post(auth.isAuthenticated(), properties_controller_1.PropertiesController.updateProperties);
    };
    return PropertiesRoutes;
}());
exports.PropertiesRoutes = PropertiesRoutes;
//# sourceMappingURL=properties-routes.js.map