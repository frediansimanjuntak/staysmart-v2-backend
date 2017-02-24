"use strict";
var attachments_dao_1 = require("../dao/attachments-dao");
var AttachmentsController = (function () {
    function AttachmentsController() {
    }
    AttachmentsController.getAll = function (req, res) {
        attachments_dao_1.default['getAll']()
            .then(function (attachments) { return res.status(200).json(attachments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AttachmentsController.getById = function (req, res) {
        var _id = req.params.id;
        attachments_dao_1.default['getById'](_id)
            .then(function (attachments) { return res.status(200).json(attachments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AttachmentsController.createAttachments = function (req, res) {
        var _attachments = req["files"].attachment;
        console.log(_attachments);
        attachments_dao_1.default['createAttachments'](_attachments)
            .then(function (attachments) { return res.status(201).json(attachments); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AttachmentsController.deleteAttachments = function (req, res) {
        var _id = req.params.id;
        attachments_dao_1.default['deleteAttachments'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return AttachmentsController;
}());
exports.AttachmentsController = AttachmentsController;
//# sourceMappingURL=attachments-controller.js.map