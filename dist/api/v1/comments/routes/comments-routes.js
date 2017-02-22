"use strict";
var comments_controller_1 = require("../controller/comments-controller");
var auth = require("../../../../auth/auth-service");
var CommentsRoutes = (function () {
    function CommentsRoutes() {
    }
    CommentsRoutes.init = function (router) {
        router
            .route('/comments')
            .get(auth.isAuthenticated(), comments_controller_1.CommentsController.getAll)
            .post(auth.isAuthenticated(), comments_controller_1.CommentsController.createComments);
        router
            .route('/comments/:id')
            .get(auth.isAuthenticated(), comments_controller_1.CommentsController.getById)
            .put(auth.isAuthenticated(), comments_controller_1.CommentsController.deleteComments)
            .delete(auth.isAuthenticated(), comments_controller_1.CommentsController.deleteReplies);
        router
            .route('/comments/update/:id')
            .post(auth.isAuthenticated(), comments_controller_1.CommentsController.updateComments);
    };
    return CommentsRoutes;
}());
exports.CommentsRoutes = CommentsRoutes;
//# sourceMappingURL=comments-routes.js.map