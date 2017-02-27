"use strict";
var companies_controller_1 = require("../controller/companies-controller");
var auth = require("../../../../auth/auth-service");
var CompaniesRoutes = (function () {
    function CompaniesRoutes() {
    }
    CompaniesRoutes.init = function (router) {
        router
            .route('/companies')
            .get(auth.isAuthenticated(), companies_controller_1.CompaniesController.getAll)
            .post(auth.isAuthenticated(), companies_controller_1.CompaniesController.createCompanies);
        router
            .route('/companies/:id')
            .get(auth.isAuthenticated(), companies_controller_1.CompaniesController.getById)
            .put(auth.isAuthenticated(), companies_controller_1.CompaniesController.deleteCompanies);
        router
            .route('/companies/update/:id')
            .post(auth.isAuthenticated(), companies_controller_1.CompaniesController.updateCompanies);
        router
            .route('/companies/document/')
            .post(auth.isAuthenticated(), companies_controller_1.CompaniesController.createDocument);
        router
            .route('/companies/document/:id')
            .post(auth.isAuthenticated(), companies_controller_1.CompaniesController.deleteDocument);
    };
    return CompaniesRoutes;
}());
exports.CompaniesRoutes = CompaniesRoutes;
//# sourceMappingURL=companies-routes.js.map