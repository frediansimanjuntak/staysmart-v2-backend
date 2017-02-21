"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var NotificationsSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    message: { type: String },
    type: { type: String },
    ref_id: { type: String },
    read_at: { type: Date },
    clicked: { type: Boolean },
    created_at: { type: Date }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotificationsSchema;
//# sourceMappingURL=notifications-model.js.map