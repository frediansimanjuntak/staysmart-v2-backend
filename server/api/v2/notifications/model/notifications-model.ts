"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var NotificationsSchema = new mongoose.Schema({
	user: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Users'
		},
	message: {type: String},
	type: {type: String},
	ref_id: {type: String},
	read_at: {type: Date},
	read: {type: Boolean, default: false},
	clicked: {type: Boolean, default: false},
	clicked_at: {type: Date},
	created_at: {type: Date, default: Date.now}
});

export default NotificationsSchema;