"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var AttachmentsSchema = new mongoose.Schema({
    name: { type: String },
    key: { type: String },
    size: { type: String },
    type: { type: String },
    metadata: {},
    remarks: { type: String },
    uploaded_at: { type: Date, default: Date.now }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AttachmentsSchema;
//# sourceMappingURL=attachments-model.js.map