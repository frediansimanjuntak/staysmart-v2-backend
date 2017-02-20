"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var PaymentsSchema = new mongoose.Schema({
	type: {type: String, required: true},
	fee: 
	[
		{
			code: {type: String, unique: true},
			name: {type: String, required: true},
			amount: {type: Number, required: true},
			status: {type: String, enum:['paid','unpaid']},
			refunded: {type: Boolean, required: true}
		}
	],
	refund: {type: Boolean, required: true},
	remarks: {type: String}
});