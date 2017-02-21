"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var blogs_model_1 = require("../model/blogs-model");
blogs_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Blogs
            .find(_query)
            .exec(function (err, blogs) {
            err ? reject(err)
                : resolve(blogs);
        });
    });
});
blogs_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Blogs
            .findById(id)
            .exec(function (err, blogs) {
            err ? reject(err)
                : resolve(blogs);
        });
    });
});
blogs_model_1.default.static('createBlogs', function (blogs) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(blogs)) {
            return reject(new TypeError('Blogs is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = blogs;
        var _blogs = new Blogs(blogs);
        _blogs.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
    });
});
blogs_model_1.default.static('deleteBlogs', function (id) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Blogs
            .findByIdAndRemove(id)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve();
        });
    });
});
blogs_model_1.default.static('updateBlogs', function (id, blogs) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(blogs)) {
            return reject(new TypeError('Blogs is not a valid object.'));
        }
        Blogs
            .findByIdAndUpdate(id, blogs)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Blogs = mongoose.model('Blogs', blogs_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Blogs;
//# sourceMappingURL=blogs-dao.js.map