"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';
import Agreements from '../../agreements/dao/agreements-dao';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var AppointmentsSchema = new mongoose.Schema({
	room_id: {type: String},
	agreement: {
		type: Schema.Types.ObjectId,
		ref: 'Agreements'
	},
	landlord: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	},
	tenant: {
		type: Schema.Types.ObjectId,
		ref: 'Users'
	},
	property: {
		type: Schema.Types.ObjectId,
		ref: 'Properties'
	},
	schedule: {
		type: String
	},
	chosen_time: {
		date: {type: String},
		from: {type: String},
		to: {type: String}
	},
	status: {
		type: String, 
		enum: ['pending','accepted','rejected','archived'], 
		default: 'pending'
	}
});


export default AppointmentsSchema;