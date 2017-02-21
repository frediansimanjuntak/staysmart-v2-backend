"use strict";
var blog_categories_dao_1 = require("../dao/blog_categories-dao");
var BlogCategoriesController = (function () {
    function BlogCategoriesController() {
    }
    BlogCategoriesController.getAll = function (req, res) {
        blog_categories_dao_1.default['getAll']()
            .then(function (blog_categories) { return res.status(200).json(blog_categories); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BlogCategoriesController.getById = function (req, res) {
        var _id = req.params.id;
        blog_categories_dao_1.default['getById'](_id)
            .then(function (blog_categories) { return res.status(200).json(blog_categories); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BlogCategoriesController.createBlogCategories = function (req, res) {
        var _blog_categories = req.body;
        blog_categories_dao_1.default['createBlogCategories'](_blog_categories)
            .then(function (blog_categories) { return res.status(201).json(blog_categories); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BlogCategoriesController.deleteBlogCategories = function (req, res) {
        var _id = req.params.id;
        blog_categories_dao_1.default['deleteBlogCategories'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BlogCategoriesController.updateBlogCategories = function (req, res) {
        var _id = req.params.id;
        var _blog_categories = req.body;
        blog_categories_dao_1.default['updateBlogCategories'](_id, _blog_categories)
            .then(function (blog_categories) { return res.status(201).json(blog_categories); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return BlogCategoriesController;
}());
exports.BlogCategoriesController = BlogCategoriesController;
//# sourceMappingURL=blog_categories-controller.js.map