"use strict";
var mongoose = require("mongoose");
var crypto = require('crypto');
var Schema = mongoose.Schema;
var CommentsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, lowercase: true, required: true },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    content: { type: String },
    blog: {
        type: Schema.Types.ObjectId,
        ref: 'Blogs'
    },
    type: { type: String },
    created_at: { type: Date, default: Date.now },
    replies: [{
            type: Schema.Types.ObjectId,
            ref: 'Comments'
        }]
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommentsSchema;
//# sourceMappingURL=comments-model.js.map