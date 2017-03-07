"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var ReportsSchema = new mongoose.Schema({
	reporter: 
	{
		type: Schema.Types.ObjectId,
		ref: 'Users'	
	},
	reported: 
	{
		type: Schema.Types.ObjectId,
		ref: 'Users'	
	},
	reason: {type: String},
	created_at: {type: Date, default: Date.now}
});

export default ReportsSchema;