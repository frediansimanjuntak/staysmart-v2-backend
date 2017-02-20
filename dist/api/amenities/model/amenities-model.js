"use strict";
var mongoose = require("mongoose");
var crypto = require('crypto');
var Schema = mongoose.Schema;
var AmenitiesSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    created_at: { type: Date, default: Date.now }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AmenitiesSchema;
//# sourceMappingURL=amenities-model.js.map