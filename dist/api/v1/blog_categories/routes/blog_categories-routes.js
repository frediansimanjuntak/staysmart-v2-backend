"use strict";
var blog_categories_controller_1 = require("../controller/blog_categories-controller");
var auth = require("../../../../auth/auth-service");
var BlogCategoriesRoutes = (function () {
    function BlogCategoriesRoutes() {
    }
    BlogCategoriesRoutes.init = function (router) {
        router
            .route('/blog-categories')
            .get(auth.isAuthenticated(), blog_categories_controller_1.BlogCategoriesController.getAll)
            .post(auth.isAuthenticated(), blog_categories_controller_1.BlogCategoriesController.createBlogCategories);
        router
            .route('/blog-categories/:id')
            .get(auth.isAuthenticated(), blog_categories_controller_1.BlogCategoriesController.getById)
            .put(auth.isAuthenticated(), blog_categories_controller_1.BlogCategoriesController.deleteBlogCategories);
        router
            .route('/blog-categories/update/:id')
            .post(auth.isAuthenticated(), blog_categories_controller_1.BlogCategoriesController.updateBlogCategories);
    };
    return BlogCategoriesRoutes;
}());
exports.BlogCategoriesRoutes = BlogCategoriesRoutes;
//# sourceMappingURL=blog_categories-routes.js.map