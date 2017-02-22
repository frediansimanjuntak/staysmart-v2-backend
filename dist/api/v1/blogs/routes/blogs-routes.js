"use strict";
var blogs_controller_1 = require("../controller/blogs-controller");
var auth = require("../../../../auth/auth-service");
var BlogsRoutes = (function () {
    function BlogsRoutes() {
    }
    BlogsRoutes.init = function (router) {
        router
            .route('/blogs')
            .get(auth.isAuthenticated(), blogs_controller_1.BlogsController.getAll)
            .post(auth.isAuthenticated(), blogs_controller_1.BlogsController.createBlogs);
        router
            .route('/blogs/:id')
            .get(auth.isAuthenticated(), blogs_controller_1.BlogsController.getById)
            .put(auth.isAuthenticated(), blogs_controller_1.BlogsController.deleteBlogs);
        router
            .route('/blogs/update/:id')
            .post(auth.isAuthenticated(), blogs_controller_1.BlogsController.updateBlogs);
    };
    return BlogsRoutes;
}());
exports.BlogsRoutes = BlogsRoutes;
//# sourceMappingURL=blogs-routes.js.map