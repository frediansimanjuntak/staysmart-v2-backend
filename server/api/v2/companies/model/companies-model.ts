"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var CompaniesSchema = new mongoose.Schema({
	name: {type: String},
	registration_number: {type: String},
	documents: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
		}
	],
	shareholders: 
	[
		{
			name: {type: String},
			identification_type: {type: String},
			identification_number: {type: String},
			identification_proof: 
			{
				front: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				},
				back: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				}
			}
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