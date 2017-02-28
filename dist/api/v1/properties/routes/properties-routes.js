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
            .delete(auth.isAuthenticated(), properties_controller_1.PropertiesController.deleteProperties);
        router
            .route('/properties/update/:id')
            .put(auth.isAuthenticated(), properties_controller_1.PropertiesController.updateProperties);
        router
            .route('/properties/details/update/:id')
            .put(auth.isAuthenticated(), properties_controller_1.PropertiesController.updateDetails);
        router
            .route('/properties/pictures/:id')
            .post(auth.isAuthenticated(), properties_controller_1.PropertiesController.createPropertyPictures);
        router
            .route('/properties/pictures/delete/:id/:type/:pictureID')
            .delete(auth.isAuthenticated(), properties_controller_1.PropertiesController.deletePropertyPictures);
        router
            .route('/properties/schedules/add/:id')
            .post(auth.isAuthenticated(), properties_controller_1.PropertiesController.createPropertySchedules);
        router
            .route('/properties/schedules/update/:id/:scheduleId')
            .put(auth.isAuthenticated(), properties_controller_1.PropertiesController.updatePropertySchedules);
        router
            .route('/properties/schedules/delete/:id/:idSchedule')
            .delete(auth.isAuthenticated(), properties_controller_1.PropertiesController.deletePropertySchedules);
        router
            .route('/properties/shareholder/update/:id')
            .put(auth.isAuthenticated(), properties_controller_1.PropertiesController.updatePropertyShareholder);
    };
    return PropertiesRoutes;
}());
exports.PropertiesRoutes = PropertiesRoutes;
//# sourceMappingURL=properties-routes.js.map