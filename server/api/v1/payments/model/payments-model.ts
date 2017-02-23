"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var PaymentsSchema = new mongoose.Schema({
	type: {type: String, enum:['loi','ta']},
	fee: 
	[
		{
			code: {type: String, unique: true},
			name: {type: String},
			amount: {type: Number},
			status: {type: String, enum:['paid','unpaid']},
			refunded: {type: Boolean}
		}
	],
	refund: {type: Boolean},
	remarks: {type: String}
});

export default PaymentsSchema;