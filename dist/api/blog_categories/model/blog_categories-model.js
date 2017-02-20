"use strict";
var mongoose = require("mongoose");
var crypto = require('crypto');
var Schema = mongoose.Schema;
var BlogCategoriesSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: { type: Date, default: Date.now },
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlogCategoriesSchema;
//# sourceMappingURL=blog_categories-model.js.map