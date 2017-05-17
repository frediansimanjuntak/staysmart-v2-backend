"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var AppointmentsSchema = new mongoose.Schema({
	room_id: {
		type: Schema.Types.ObjectId,
		ref: 'ChatRooms'
	},
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
	},
	state: {
		type: String, 
		enum: ['under consideration', 'initiate letter of intent', 'initiate tenancy agreement'], 
		default: 'under consideration'
	}
});


export default AppointmentsSchema;