"use strict";
var amenities_controller_1 = require("../controller/amenities-controller");
var auth = require("../../../../auth/auth-service");
var AmenitiesRoutes = (function () {
    function AmenitiesRoutes() {
    }
    AmenitiesRoutes.init = function (router) {
        router
            .route('/amenities')
            .get(auth.isAuthenticated(), amenities_controller_1.AmenitiesController.getAll)
            .post(auth.isAuthenticated(), amenities_controller_1.AmenitiesController.createAmenities);
        router
            .route('/amenities/:id')
            .get(auth.isAuthenticated(), amenities_controller_1.AmenitiesController.getById)
            .put(auth.isAuthenticated(), amenities_controller_1.AmenitiesController.deleteAmenities);
        router
            .route('/amenities/update/:id')
            .post(auth.isAuthenticated(), amenities_controller_1.AmenitiesController.updateAmenities);
    };
    return AmenitiesRoutes;
}());
exports.AmenitiesRoutes = AmenitiesRoutes;
//# sourceMappingURL=amenities-routes.js.map