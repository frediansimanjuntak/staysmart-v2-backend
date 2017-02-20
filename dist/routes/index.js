"use strict";
var todo_route_1 = require("../api/todo/route/todo-route");
var users_routes_1 = require("../api/users/routes/users-routes");
var Routes = (function () {
    function Routes() {
    }
    Routes.init = function (app, router) {
        todo_route_1.TodoRoutes.init(router);
        users_routes_1.UserRoutes.init(router);
        app.use("/", router);
    };
    return Routes;
}());
exports.Routes = Routes;
//# sourceMappingURL=index.js.map