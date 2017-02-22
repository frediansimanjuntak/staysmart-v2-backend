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
        var _shareholder = req["shareholder"].body;
        var _front = req["front"].attachment;
        var _back = req["back"].attachment;
        properties_dao_1.default['createProperties'](_properties, _shareholder, _front, _back)
            .then(function (properties) { return res.status(201).json(properties); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    PropertiesController.deleteProperties = function (req, res) {
        var _id = req.params.id;
        properties_dao_1.default['deleteProperties'](_id)
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