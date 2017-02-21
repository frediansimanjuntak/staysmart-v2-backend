"use strict";
var companies_controller_1 = require("../controller/companies-controller");
var CompaniesRoutes = (function () {
    function CompaniesRoutes() {
    }
    CompaniesRoutes.init = function (router) {
        router
            .route('/companies')
            .get(companies_controller_1.CompaniesController.getAll)
            .post(companies_controller_1.CompaniesController.createCompanies);
        router
            .route('/companies/:id')
            .get(companies_controller_1.CompaniesController.getById)
            .put(companies_controller_1.CompaniesController.deleteCompanies);
        router
            .route('/companies/update/:id')
            .post(companies_controller_1.CompaniesController.updateCompanies);
    };
    return CompaniesRoutes;
}());
exports.CompaniesRoutes = CompaniesRoutes;
//# sourceMappingURL=companies-routes.js.map