"use strict";
var mongoose = require("mongoose");
var Promise = require("bluebird");
var _ = require("lodash");
var comments_model_1 = require("../model/comments-model");
var blogs_dao_1 = require("../../blogs/dao/blogs-dao");
comments_model_1.default.static('getAll', function () {
    return new Promise(function (resolve, reject) {
        var _query = {};
        Comments
            .find(_query)
            .populate("replies")
            .exec(function (err, comments) {
            err ? reject(err)
                : resolve(comments);
        });
    });
});
comments_model_1.default.static('getById', function (id) {
    return new Promise(function (resolve, reject) {
        Comments
            .findById(id)
            .populate("replies")
            .exec(function (err, comments) {
            err ? reject(err)
                : resolve(comments);
        });
    });
});
comments_model_1.default.static('createComments', function (comments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(comments)) {
            return reject(new TypeError('Comment is not a valid object.'));
        }
        var ObjectID = mongoose.Types.ObjectId;
        var body = comments;
        var _comments = new Comments(comments);
        _comments.save(function (err, saved) {
            err ? reject(err)
                : resolve(saved);
        });
        var commentId = _comments._id;
        if (body.commentID) {
            Comments
                .findByIdAndUpdate(body.commentID, {
                $push: {
                    "replies": commentId
                }
            })
                .exec(function (err, update) {
                err ? reject(err)
                    : resolve(update);
            });
        }
        else {
            blogs_dao_1.default
                .findByIdAndUpdate(body.blog, {
                $push: {
                    "comments": commentId
                }
            })
                .exec(function (err, update) {
                err ? reject(err)
                    : resolve(update);
            });
        }
    });
});
comments_model_1.default.static('deleteReplies', function (idComment, reply) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(idComment) && !_.isObject(reply)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        var body = reply;
        Comments
            .update({ "_id": idComment }, {
            $pull: {
                "replies": body.idReply
            }
        })
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve(deleted);
        });
        Comments
            .findByIdAndRemove(body.idReply)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve(deleted);
        });
    });
});
comments_model_1.default.static('deleteComments', function (idComment) {
    return new Promise(function (resolve, reject) {
        if (!_.isString(idComment)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Comments
            .findById(idComment, function (err, commentt) {
            if (commentt.replies != null) {
                var ObjectID = mongoose.Types.ObjectId;
                var commentt_reply = [].concat(commentt.replies);
                for (var i = 0; i < commentt_reply.length; i++) {
                    var reply = commentt_reply[i];
                    Comments
                        .findByIdAndRemove(reply)
                        .exec(function (err, deleted) {
                        err ? reject(err)
                            : resolve(deleted);
                    });
                }
            }
        })
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve(deleted);
        });
        Comments
            .findByIdAndRemove(idComment)
            .exec(function (err, deleted) {
            err ? reject(err)
                : resolve(deleted);
        });
    });
});
comments_model_1.default.static('updateComments', function (id, comments) {
    return new Promise(function (resolve, reject) {
        if (!_.isObject(comments)) {
            return reject(new TypeError('Comment is not a valid object.'));
        }
        Comments
            .findByIdAndUpdate(id, comments)
            .exec(function (err, updated) {
            err ? reject(err)
                : resolve(updated);
        });
    });
});
var Comments = mongoose.model('Comments', comments_model_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Comments;
//# sourceMappingURL=comments-dao.js.map