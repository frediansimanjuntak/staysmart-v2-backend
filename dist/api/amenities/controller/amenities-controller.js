"use strict";
var amenities_dao_1 = require("../dao/amenities-dao");
var AmenitiesController = (function () {
    function AmenitiesController() {
    }
    AmenitiesController.getAll = function (req, res) {
        amenities_dao_1.default['getAll']()
            .then(function (amenities) { return res.status(200).json(amenities); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AmenitiesController.getById = function (req, res) {
        var _id = req.params.id;
        amenities_dao_1.default['getById'](_id)
            .then(function (amenities) { return res.status(200).json(amenities); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AmenitiesController.createAmenities = function (req, res) {
        var _amenities = req.body;
        amenities_dao_1.default['createAmenities'](_amenities)
            .then(function (amenities) { return res.status(201).json(amenities); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AmenitiesController.deleteAmenities = function (req, res) {
        var _id = req.params.id;
        amenities_dao_1.default['deleteAmenities'](_id)
            .then(function () { return res.status(200).end(); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    AmenitiesController.updateAmenities = function (req, res) {
        var _id = req.params.id;
        var _amenities = req.body;
        amenities_dao_1.default['updateAmenities'](_id, _amenities)
            .then(function (amenities) { return res.status(201).json(amenities); })
            .catch(function (error) { return res.status(400).json(error); });
    };
    return AmenitiesController;
}());
exports.AmenitiesController = AmenitiesController;
//# sourceMappingURL=amenities-controller.js.map