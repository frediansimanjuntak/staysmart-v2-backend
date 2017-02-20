"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var CompaniesSchema = new mongoose.Schema({
	name: {type: String},
	registeration_number: {type: String},
	document: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
		}
	],
	created_by: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Users'
		},
	created_at: {type: Date}
});

export default CompaniesSchema;