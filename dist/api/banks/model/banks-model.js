"use strict";
var mongoose = require("mongoose");
var crypto = require('crypto');
var Schema = mongoose.Schema;
var BanksSchema = new mongoose.Schema({
    code: { type: String },
    name: { type: String },
    description: { type: String },
    created_at: { type: Date, default: Date.now }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BanksSchema;
//# sourceMappingURL=banks-model.js.map