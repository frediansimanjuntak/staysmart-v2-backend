"use strict";
var todo_route_1 = require("../api/todo/route/todo-route");
var users_routes_1 = require("../api/users/routes/users-routes");
var blog_categories_routes_1 = require("../api/blog_categories/routes/blog_categories-routes");
var faqs_routes_1 = require("../api/faqs/routes/faqs-routes");
var banks_routes_1 = require("../api/banks/routes/banks-routes");
var Routes = (function () {
    function Routes() {
    }
    Routes.init = function (app, router) {
        todo_route_1.TodoRoutes.init(router);
        users_routes_1.UserRoutes.init(router);
        blog_categories_routes_1.BlogCategoriesRoutes.init(router);
        faqs_routes_1.FaqsRoutes.init(router);
        banks_routes_1.BanksRoutes.init(router);
        app.use("/", router);
    };
    return Routes;
}());
exports.Routes = Routes;
//# sourceMappingURL=index.js.map