"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var FaqsSchema = new mongoose.Schema({
	question: {type: String, required: true},
	answer: {type: String, required: true},
	for: {
		type: String,
		enum: ['landlord','tenant']		
	},
	created_at: {type: Date, default: Date.now},
	created_by: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	}
});

export default FaqsSchema;