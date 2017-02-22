"use strict";
var users_controller_1 = require("../controller/users-controller");
var auth = require("../../../../auth/auth-service");
var UserRoutes = (function () {
    function UserRoutes() {
    }
    UserRoutes.init = function (router) {
        router
            .route('/users')
            .get(auth.isAuthenticated(), users_controller_1.UsersController.getAll)
            .post(auth.isAuthenticated(), users_controller_1.UsersController.createUser);
        router
            .route('/users/:id')
            .get(auth.isAuthenticated(), users_controller_1.UsersController.getById)
            .put(auth.isAuthenticated(), users_controller_1.UsersController.deleteUser);
        router
            .route('/users/update/:id')
            .post(auth.isAuthenticated(), users_controller_1.UsersController.updateUser);
        router
            .route('/')
            .get(auth.isAuthenticated(), users_controller_1.UsersController.index);
        router
            .route('/me')
            .get(auth.isAuthenticated(), users_controller_1.UsersController.me);
        router
            .route('/users/active/:id/:code')
            .post(auth.isAuthenticated(), users_controller_1.UsersController.activationUser);
        router
            .route('/users/unactive/:id')
            .post(auth.isAuthenticated(), users_controller_1.UsersController.unActiveUser);
    };
    return UserRoutes;
}());
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=users-routes.js.map