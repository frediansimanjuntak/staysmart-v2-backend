"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var BlogCategoriesSchema = new mongoose.Schema({
	name: {type: String},
	description: {type: String},
	created_by: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	},
	created_at: {type: Date, default: Date.now},
});