"use strict";
var comments_controller_1 = require("../controller/comments-controller");
var CommentsRoutes = (function () {
    function CommentsRoutes() {
    }
    CommentsRoutes.init = function (router) {
        router
            .route('/comments')
            .get(comments_controller_1.CommentsController.getAll)
            .post(comments_controller_1.CommentsController.createComments);
        router
            .route('/comments/:id')
            .get(comments_controller_1.CommentsController.getById)
            .put(comments_controller_1.CommentsController.deleteComments);
        router
            .route('/comments/update/:id')
            .post(comments_controller_1.CommentsController.updateComments);
    };
    return CommentsRoutes;
}());
exports.CommentsRoutes = CommentsRoutes;
//# sourceMappingURL=comments-routes.js.map