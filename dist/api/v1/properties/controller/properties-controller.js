"use strict";
var properties_dao_1 = require("../dao/properties-dao");
var PropertiesController = (function () {
    function PropertiesController() {
    }
    PropertiesController.getAll = function (req, res) {
        properties_dao_1.default['getAll']()
            .then(function (properties) { return res.status(200).json(properties); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PropertiesController.getById = function (req, res) {
        var _id = req.params.id;
        properties_dao_1.default['getById'](_id)
            .then(function (properties) { return res.status(200).json(properties); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PropertiesController.createProperties = function (req, res) {
        var _properties = req.body;
        properties_dao_1.default['createProperties'](_properties)
            .then(function (properties) { return res.status(201).json(properties); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PropertiesController.createPropertyPictures = function (req, res) {
        var _propertyID = req.params.id;
        var _living = req["files"].living;
        var _dining = req["files"].dining;
        var _bed = req["files"].bed;
        var _toilet = req["files"].toilet;
        var _kitchen = req["files"].kitchen;
        properties_dao_1.default['createPropertyPictures'](_propertyID, _living, _dining, _bed, _toilet, _kitchen)
            .then(function (properties) { return res.status(201).json(properties); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PropertiesController.updatePropertySchedules = function (req, res) {
        var _id = req.params.id;
        var _schedules = req.body;
        properties_dao_1.default['updatePropertySchedules'](_id, _schedules)
            .then(function (properties) { return res.status(201).json(properties); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PropertiesController.deleteProperties = function (req, res) {
        var _id = req.params.id;
        properties_dao_1.default['deleteProperties'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PropertiesController.deletePropertyPictures = function (req, res) {
        var _id = req.params.id;
        var _type = req.params.type;
        var _pictureID = req.params.pictureID;
        properties_dao_1.default['deletePropertyPictures'](_id, _type, _pictureID)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PropertiesController.deletePropertySchedules = function (req, res) {
        var _id = req.params.id;
        var _idSchedule = req.params.idSchedule;
        properties_dao_1.default['deletePropertySchedules'](_id, _idSchedule)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PropertiesController.updateProperties = function (req, res) {
        var _id = req.params.id;
        var _properties = req.body;
        properties_dao_1.default['updateProperties'](_id, _properties)
            .then(function (properties) { return res.status(201).json(properties); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return PropertiesController;
}());
exports.PropertiesController = PropertiesController;
//# sourceMappingURL=properties-controller.js.map