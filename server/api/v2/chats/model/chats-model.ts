"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var ChatsSchema = new mongoose.Schema({
	room_id: {type: String},
	property_id: {
		type: Schema.Types.ObjectId,
		ref: 'Properties'
	},
	landlord: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	},
	tenant: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	},
	created_at: {type: Date, default: Date.now},
});

export default ChatsSchema;