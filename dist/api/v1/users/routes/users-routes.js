"use strict";
var users_controller_1 = require("../controller/users-controller");
var UserRoutes = (function () {
    function UserRoutes() {
    }
    UserRoutes.init = function (router) {
        router
            .route('/users')
            .get(users_controller_1.UsersController.getAll)
            .post(users_controller_1.UsersController.createUser);
        router
            .route('/users/:id')
            .get(users_controller_1.UsersController.getById)
            .put(users_controller_1.UsersController.deleteUser);
        router
            .route('/users/update/:id')
            .post(users_controller_1.UsersController.updateUser);
        router
            .route('/')
            .get(users_controller_1.UsersController.index);
        router
            .route('/me')
            .get(users_controller_1.UsersController.me);
        router
            .route('/users/active/:id/:code')
            .post(users_controller_1.UsersController.activationUser);
        router
            .route('/users/unactive/:id')
            .post(users_controller_1.UsersController.unActiveUser);
    };
    return UserRoutes;
}());
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=users-routes.js.map