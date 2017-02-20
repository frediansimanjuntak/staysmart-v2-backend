"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var BlogsSchema = new mongoose.Schema({
    cover: {
        type: Schema.Types.ObjectId,
        ref: 'Attachments'
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'BlogCategories'
    },
    title: { type: String },
    source: { type: String },
    content: { type: String },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comments'
        }
    ],
    created_at: { type: Date },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlogsSchema;
//# sourceMappingURL=blogs-model.js.map