"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CompaniesSchema = new mongoose.Schema({
    name: { type: String },
    registeration_number: { type: String },
    document: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Attachments'
        }
    ],
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: { type: Date }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CompaniesSchema;
//# sourceMappingURL=companies-model.js.map