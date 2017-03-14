"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var PaymentsSchema = new mongoose.Schema({
	type: {type: String, enum:['loi','ta']},
	fee: 
	[
		{
			code: {type: String},
			name: {type: String},
			amount: {type: Number},
			status: {type: String, enum:['paid','unpaid']},
			refunded: {type: Boolean}
		}
	],
	attachment: {
		type: Schema.Types.ObjectId,
		ref: 'Attachments'	
	},
	payment_confirmation: {
		type: Schema.Types.ObjectId,
		ref: 'Attachments'
	},
	fee_payment:{type: String},
	total_payment: {type: String},
	minus_payment: {type: String},
	refund_payment: {type: String},
	refund: {type: Boolean, default: false},
	remarks: {type: String}
});

export default PaymentsSchema;	