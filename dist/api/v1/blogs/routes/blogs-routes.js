"use strict";
var blogs_controller_1 = require("../controller/blogs-controller");
var BlogsRoutes = (function () {
    function BlogsRoutes() {
    }
    BlogsRoutes.init = function (router) {
        router
            .route('/blogs')
            .get(blogs_controller_1.BlogsController.getAll)
            .post(blogs_controller_1.BlogsController.createBlogs);
        router
            .route('/blogs/:id')
            .get(blogs_controller_1.BlogsController.getById)
            .put(blogs_controller_1.BlogsController.deleteBlogs);
        router
            .route('/blogs/update/:id')
            .post(blogs_controller_1.BlogsController.updateBlogs);
    };
    return BlogsRoutes;
}());
exports.BlogsRoutes = BlogsRoutes;
//# sourceMappingURL=blogs-routes.js.map