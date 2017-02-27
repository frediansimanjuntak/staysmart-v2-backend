"use strict";
var blogs_dao_1 = require("../dao/blogs-dao");
var BlogsController = (function () {
    function BlogsController() {
    }
    BlogsController.getAll = function (req, res) {
        blogs_dao_1.default['getAll']()
            .then(function (blogs) { return res.status(200).json(blogs); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BlogsController.getById = function (req, res) {
        var _id = req.params.id;
        blogs_dao_1.default['getById'](_id)
            .then(function (blogs) { return res.status(200).json(blogs); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BlogsController.createBlogs = function (req, res) {
        var _blogs = req.body;
        var _covers = req["files"].cover;
        var _created_by = req["user"]._id;
        blogs_dao_1.default['createBlogs'](_blogs, _covers, _created_by)
            .then(function (blogs) { return res.status(201).json(blogs); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BlogsController.deleteBlogs = function (req, res) {
        var _id = req.params.id;
        blogs_dao_1.default['deleteBlogs'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    BlogsController.updateBlogs = function (req, res) {
        var _id = req.params.id;
        var _blogs = req.body;
        var _covers = req["files"].cover;
        blogs_dao_1.default['updateBlogs'](_id, _blogs, _covers)
            .then(function (blogs) { return res.status(201).json(blogs); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return BlogsController;
}());
exports.BlogsController = BlogsController;
//# sourceMappingURL=blogs-controller.js.map