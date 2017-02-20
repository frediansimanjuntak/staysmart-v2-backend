"use strict";
var users_controller_1 = require("../controller/users-controller");
var UserRoutes = (function () {
    function UserRoutes() {
    }
    UserRoutes.init = function (router) {
        router
            .route('/api/users')
            .get(users_controller_1.UsersController.getAll)
            .post(users_controller_1.UsersController.createUser);
        router
            .route('/api/users/:id')
            .get(users_controller_1.UsersController.getById)
            .put(users_controller_1.UsersController.deleteUser);
        router
            .route('/api/users/update/:id')
            .post(users_controller_1.UsersController.updateUser);
        router
            .route('/')
            .get(users_controller_1.UsersController.index);
        router
            .route('/me')
            .get(users_controller_1.UsersController.me);
    };
    return UserRoutes;
}());
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=users-routes.js.map