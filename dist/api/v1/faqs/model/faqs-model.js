"use strict";
var mongoose = require("mongoose");
var crypto = require('crypto');
var Schema = mongoose.Schema;
var FaqsSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    for: {
        type: String,
        enum: ['landlord', 'tenant']
    },
    created_at: { type: Date, default: Date.now },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FaqsSchema;
//# sourceMappingURL=faqs-model.js.map