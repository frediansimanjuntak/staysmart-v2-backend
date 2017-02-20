"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var PaymentsSchema = new mongoose.Schema({
    type: { type: String, required: true },
    fee: [
        {
            code: { type: String, unique: true },
            name: { type: String, required: true },
            amount: { type: Number, required: true },
            status: { type: String, enum: ['paid', 'unpaid'] },
            refunded: { type: Boolean, required: true }
        }
    ],
    refund: { type: Boolean, required: true },
    remarks: { type: String }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PaymentsSchema;
//# sourceMappingURL=payments-model.js.map