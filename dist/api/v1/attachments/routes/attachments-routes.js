"use strict";
var attachments_controller_1 = require("../controller/attachments-controller");
var auth = require("../../../../auth/auth-service");
var AttachmentsRoutes = (function () {
    function AttachmentsRoutes() {
    }
    AttachmentsRoutes.init = function (router) {
        router
            .route('/attachments')
            .get(auth.isAuthenticated(), attachments_controller_1.AttachmentsController.getAll)
            .post(auth.isAuthenticated(), attachments_controller_1.AttachmentsController.createAttachments);
        router
            .route('/attachments/:id')
            .get(auth.isAuthenticated(), attachments_controller_1.AttachmentsController.getById)
            .put(auth.isAuthenticated(), attachments_controller_1.AttachmentsController.deleteAttachments);
    };
    return AttachmentsRoutes;
}());
exports.AttachmentsRoutes = AttachmentsRoutes;
//# sourceMappingURL=attachments-routes.js.map