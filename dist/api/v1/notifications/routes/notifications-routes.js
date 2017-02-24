"use strict";
var notifications_controller_1 = require("../controller/notifications-controller");
var auth = require("../../../../auth/auth-service");
var NotificationsRoutes = (function () {
    function NotificationsRoutes() {
    }
    NotificationsRoutes.init = function (router) {
        router
            .route('/notifications')
            .get(auth.isAuthenticated(), notifications_controller_1.NotificationsController.getAll)
            .post(auth.isAuthenticated(), notifications_controller_1.NotificationsController.createNotifications);
        router
            .route('/notifications/:id')
            .get(auth.isAuthenticated(), notifications_controller_1.NotificationsController.getById)
            .put(auth.isAuthenticated(), notifications_controller_1.NotificationsController.deleteNotifications);
        router
            .route('/notifications/update/:type/:id')
            .post(auth.isAuthenticated(), notifications_controller_1.NotificationsController.updateNotifications);
    };
    return NotificationsRoutes;
}());
exports.NotificationsRoutes = NotificationsRoutes;
//# sourceMappingURL=notifications-routes.js.map