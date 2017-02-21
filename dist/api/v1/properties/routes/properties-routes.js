"use strict";
var properties_controller_1 = require("../controller/properties-controller");
var PropertiesRoutes = (function () {
    function PropertiesRoutes() {
    }
    PropertiesRoutes.init = function (router) {
        router
            .route('/properties')
            .get(properties_controller_1.PropertiesController.getAll)
            .post(properties_controller_1.PropertiesController.createProperties);
        router
            .route('/properties/:id')
            .get(properties_controller_1.PropertiesController.getById)
            .put(properties_controller_1.PropertiesController.deleteProperties);
        router
            .route('/properties/update/:id')
            .post(properties_controller_1.PropertiesController.updateProperties);
    };
    return PropertiesRoutes;
}());
exports.PropertiesRoutes = PropertiesRoutes;
//# sourceMappingURL=properties-routes.js.map