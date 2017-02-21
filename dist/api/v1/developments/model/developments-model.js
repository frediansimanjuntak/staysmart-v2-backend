"use strict";
var mongoose = require("mongoose");
var crypto = require('crypto');
var Schema = mongoose.Schema;
var DevelopmentsSchema = new mongoose.Schema({
    name: { type: String },
    slug: { type: String },
    number_of_units: { type: Number },
    properties: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Properties'
        }
    ],
    tenure: { type: String },
    age: { type: Number },
    planning_region: { type: String },
    planning_area: { type: String },
    type_of_area: { type: String },
    postal_district: { type: Number }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DevelopmentsSchema;
//# sourceMappingURL=developments-model.js.map