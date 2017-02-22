"use strict";
var banks_controller_1 = require("../controller/banks-controller");
var auth = require("../../../../auth/auth-service");
var BanksRoutes = (function () {
    function BanksRoutes() {
    }
    BanksRoutes.init = function (router) {
        router
            .route('/banks')
            .get(auth.isAuthenticated(), banks_controller_1.BanksController.getAll)
            .post(auth.isAuthenticated(), banks_controller_1.BanksController.createBanks);
        router
            .route('/banks/:id')
            .get(auth.isAuthenticated(), banks_controller_1.BanksController.getById)
            .put(auth.isAuthenticated(), banks_controller_1.BanksController.deleteBanks);
        router
            .route('/banks/update/:id')
            .post(auth.isAuthenticated(), banks_controller_1.BanksController.updateBanks);
    };
    return BanksRoutes;
}());
exports.BanksRoutes = BanksRoutes;
//# sourceMappingURL=banks-routes.js.map