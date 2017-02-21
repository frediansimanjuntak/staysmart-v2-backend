"use strict";
var notifications_controller_1 = require("../controller/notifications-controller");
var NotificationsRoutes = (function () {
    function NotificationsRoutes() {
    }
    NotificationsRoutes.init = function (router) {
        router
            .route('/notifications')
            .get(notifications_controller_1.NotificationsController.getAll)
            .post(notifications_controller_1.NotificationsController.createNotifications);
        router
            .route('/notifications/:id')
            .get(notifications_controller_1.NotificationsController.getById)
            .put(notifications_controller_1.NotificationsController.deleteNotifications);
        router
            .route('/notifications/update/:id')
            .post(notifications_controller_1.NotificationsController.updateNotifications);
    };
    return NotificationsRoutes;
}());
exports.NotificationsRoutes = NotificationsRoutes;
//# sourceMappingURL=notifications-routes.js.map