"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var BlogsSchema = new mongoose.Schema({
	cover: {type: String},
	category: {type: String},
	title: {type: String},
	source: {type: String},
	content: {type: String},
	comments:
	[
		{type: String}
	],
	created_at: {type: Date},
	created_by: {type: String}
});

export default BlogsSchema;