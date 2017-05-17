"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var ChatsSchema = new mongoose.Schema({
	room_id: {type: String},
	property: {
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
	manager: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	},
	agreement: {
		type: Schema.Types.ObjectId,
		ref: 'Agreements'
	},
	status: {
		type: String, 
		enum: ['enquiries', 'pending', 'rented'],
		default: 'enquiries'
	},
	archived: {type: Boolean, default: false},
	created_at: {type: Date, default: Date.now},
});

export default ChatsSchema;