"use strict";
var mongoose = require("mongoose");
var crypto = require('crypto');
var Schema = mongoose.Schema;
var BanksSchema = new mongoose.Schema({
    code: { type: String },
    name: { type: String },
    description: { type: String },
    created_at: { type: Date, "default": Date.now }
});
exports.__esModule = true;
exports["default"] = BanksSchema;
