"use strict";
var banks_controller_1 = require("../controller/banks-controller");
var BanksRoutes = (function () {
    function BanksRoutes() {
    }
    BanksRoutes.init = function (router) {
        router
            .route('/api/banks')
            .get(banks_controller_1.BanksController.getAll)
            .post(banks_controller_1.BanksController.createBanks);
        router
            .route('/api/banks/:id')
            .get(banks_controller_1.BanksController.getById)
            .put(banks_controller_1.BanksController.deleteBanks);
        router
            .route('/api/banks/update/:id')
            .post(banks_controller_1.BanksController.updateBanks);
    };
    return BanksRoutes;
}());
exports.BanksRoutes = BanksRoutes;
//# sourceMappingURL=banks-routes.js.map