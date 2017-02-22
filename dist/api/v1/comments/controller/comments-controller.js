"use strict";
var comments_dao_1 = require("../dao/comments-dao");
var CommentsController = (function () {
    function CommentsController() {
    }
    CommentsController.getAll = function (req, res) {
        comments_dao_1.default['getAll']()
            .then(function (comments) { return res.status(200).json(comments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CommentsController.getById = function (req, res) {
        var _id = req.params.id;
        comments_dao_1.default['getById'](_id)
            .then(function (comments) { return res.status(200).json(comments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CommentsController.createComments = function (req, res) {
        var _comments = req.body;
        comments_dao_1.default['createComments'](_comments)
            .then(function (comments) { return res.status(201).json(comments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CommentsController.deleteReplies = function (req, res) {
        var _idComment = req.params.id;
        var reply = req.body;
        comments_dao_1.default['deleteReplies'](_idComment, reply)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CommentsController.deleteComments = function (req, res) {
        var _idComment = req.params.id;
        comments_dao_1.default['deleteComments'](_idComment)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    CommentsController.updateComments = function (req, res) {
        var _id = req.params.id;
        var _comments = req.body;
        comments_dao_1.default['updateComments'](_id, _comments)
            .then(function (comments) { return res.status(201).json(comments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return CommentsController;
}());
exports.CommentsController = CommentsController;
//# sourceMappingURL=comments-controller.js.map