"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var ManagersSchema = new mongoose.Schema({
	property: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Properties'
		},
	owner: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Users'
		},
	manager: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Users'
		},
	chat: {type: Boolean, default: false},
	status: {type: String, enum:['pending', 'accepted', 'rejected']},
	created_at: {type: Date, default: Date.now}		
});

export default ManagersSchema;