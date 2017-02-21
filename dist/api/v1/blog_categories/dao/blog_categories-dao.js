"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var blog_categories_model_1 = require("../model/blog_categories-model");
blog_categories_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        BlogCategories
            .find(_query)
            .exec(function (err, blog_categories) {
            err ? reject(err)
                : resolve(blog_categories);
        });
    });
});
blog_categories_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        BlogCategories
            .findById(id)
            .exec(function (err, blog_categories) {
            err ? reject(err)
                : resolve(blog_categories);
        });
    });
});
blog_categories_model_1.default.static('createBlogCategories', function (blog_categories) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(blog_categories)) {
            return reject(new TypeError('User is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = blog_categories;
        var _blog_categories = new BlogCategories(blog_categories);
        _blog_categories.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
blog_categories_model_1.default.static('deleteBlogCategories', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        BlogCategories
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
blog_categories_model_1.default.static('updateBlogCategories', function (id, blog_categories) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(blog_categories)) {
            return reject(new TypeError('User is not a valid object.'));
        }
        BlogCategories
            .findByIdAndUpdate(id, blog_categories)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var BlogCategories = mongoose.model('BlogCategories', blog_categories_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlogCategories;
//# sourceMappingURL=blog_categories-dao.js.map