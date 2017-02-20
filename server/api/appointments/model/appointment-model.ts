"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var AppoinmentSchema = new mongoose.Schema({
	room_id: {type: String},
	landlord: {type: String},
	tenant: {type: String},
	property: {type: String},
	schedule: {type: String},
	choosen_time: {
		date: {type: Date},
		from: {type: String},
		to: {type: String}
	},
	status: {
		type: String, 
		enum: ['pending','accepted','rejected','archived'], 
		default: 'pending'
	}
});