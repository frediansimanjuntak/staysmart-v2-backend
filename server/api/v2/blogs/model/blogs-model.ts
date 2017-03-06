"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var BlogsSchema = new mongoose.Schema({
	cover:
		{
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
		},
	category:
		{
			type: Schema.Types.ObjectId,
			ref: 'BlogCategories'
		},
	title: {type: String},
	slug: {type: String},
	source: {type: String},
	content: {type: String},
	comments:
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Comments'
		}
	],
	created_at: {type: Date, default: Date.now},
	created_by:
		{
			type: Schema.Types.ObjectId,
			ref: 'Users'
		}
});

export default BlogsSchema;