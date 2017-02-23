"use strict";
var agreements_controller_1 = require("../controller/agreements-controller");
var AgreementsRoutes = (function () {
    function AgreementsRoutes() {
    }
    AgreementsRoutes.init = function (router) {
        router
            .route('/agreements')
            .get(agreements_controller_1.AgreementsController.getAll)
            .post(agreements_controller_1.AgreementsController.createAgreements);
        router
            .route('/agreements/:id')
            .get(agreements_controller_1.AgreementsController.getById)
            .put(agreements_controller_1.AgreementsController.deleteAgreements);
        router
            .route('/agreements/update/:id')
            .post(agreements_controller_1.AgreementsController.updateAgreements);
        router
            .route('/agreements/update/:id/:type')
            .post(agreements_controller_1.AgreementsController.updateAgreementsData);
    };
    return AgreementsRoutes;
}());
exports.AgreementsRoutes = AgreementsRoutes;
//# sourceMappingURL=agreements-routes.js.map