"use strict";
var blog_categories_controller_1 = require("../controller/blog_categories-controller");
var BlogCategoriesRoutes = (function () {
    function BlogCategoriesRoutes() {
    }
    BlogCategoriesRoutes.init = function (router) {
        router
            .route('/blog-categories')
            .get(blog_categories_controller_1.BlogCategoriesController.getAll)
            .post(blog_categories_controller_1.BlogCategoriesController.createBlogCategories);
        router
            .route('/blog-categories/:id')
            .get(blog_categories_controller_1.BlogCategoriesController.getById)
            .put(blog_categories_controller_1.BlogCategoriesController.deleteBlogCategories);
        router
            .route('/blog-categories/update/:id')
            .post(blog_categories_controller_1.BlogCategoriesController.updateBlogCategories);
    };
    return BlogCategoriesRoutes;
}());
exports.BlogCategoriesRoutes = BlogCategoriesRoutes;
//# sourceMappingURL=blog_categories-routes.js.map