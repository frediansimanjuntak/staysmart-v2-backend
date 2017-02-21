"use strict";
var amenities_controller_1 = require("../controller/amenities-controller");
var AmenitiesRoutes = (function () {
    function AmenitiesRoutes() {
    }
    AmenitiesRoutes.init = function (router) {
        router
            .route('/api/amenities')
            .get(amenities_controller_1.AmenitiesController.getAll)
            .post(amenities_controller_1.AmenitiesController.createAmenities);
        router
            .route('/api/amenities/:id')
            .get(amenities_controller_1.AmenitiesController.getById)
            .put(amenities_controller_1.AmenitiesController.deleteAmenities);
        router
            .route('/api/amenities/update/:id')
            .post(amenities_controller_1.AmenitiesController.updateAmenities);
    };
    return AmenitiesRoutes;
}());
exports.AmenitiesRoutes = AmenitiesRoutes;
//# sourceMappingURL=amenities-routes.js.map