"use strict";
var attachments_controller_1 = require("../controller/attachments-controller");
var AttachmentsRoutes = (function () {
    function AttachmentsRoutes() {
    }
    AttachmentsRoutes.init = function (router) {
        router
            .route('/attachments')
            .get(attachments_controller_1.AttachmentsController.getAll)
            .post(attachments_controller_1.AttachmentsController.createAttachments);
        router
            .route('/attachments/:id')
            .get(attachments_controller_1.AttachmentsController.getById)
            .put(attachments_controller_1.AttachmentsController.deleteAttachments);
        router
            .route('/attachments/update/:id')
            .post(attachments_controller_1.AttachmentsController.updateAttachments);
    };
    return AttachmentsRoutes;
}());
exports.AttachmentsRoutes = AttachmentsRoutes;
//# sourceMappingURL=attachments-routes.js.map