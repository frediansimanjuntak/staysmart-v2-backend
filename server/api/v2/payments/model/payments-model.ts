"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var PaymentsSchema = new mongoose.Schema({
	type: {type: String, enum:['loi','ta']},
	fee: 
	[
		{
			code_name: {type: String},
			name: {type: String},
			amount: {type: Number},
			received_amount: {type: Number},
			needed_refund: {type: Boolean},			
			refunded: {type: Boolean},
			created_at: {type: Date},
			updated_at: {type: Date}
		}
	],
	attachment: {
		payment: {
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
		},
		payment_confirm: {
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
		},
		refund_confirm: {
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
		}
	},	
	status: {type: String, enum: ['pending', 'accepted', 'rejected']},
	remarks: {type: String}
});

export default PaymentsSchema;	