"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true, required: true},
	email: {type: String, lowercase: true, unique: true, required: true},
	password: {type: String, required: true},  
	phone:{type: String},
	role: {type: String, enum: ['user','admin'], default: 'user'},
	verification: {
		verified: {type: Boolean, default: false},
		verified_date: {type: Date},
		expires: {type: Date},
		code: {type: String}
	},
	tenant: {
		data: {
			name: {type: String},
			identification_type: {type: String},
			identification_number: {type: String},
			identification_proof: {
				front: {type: String},
				back: {type: String}
			},
			bank_account: {
				bank: {type: String},
				name: {type: String},
				no: {type: String}
			}
		},
		histories: 
		[{
			date: {type: Date},
			data: {}
		}]
	},
	landlord: {
		data: {
			name: {type: String},
			identification_type: {type: String},
			identification_number: {type: String},
			identification_proof: {
				front: {type: String},
				back: {type: String}
			},
			company: {type: String},
			bank_account: {
				bank: {type: String},
				name: {type: String},
				no: {type: String}
			}
		},
		histories: 
		[{
			date: {type: Date},
			data: {}
		}]
	},
	owned_properties: 
	[
		{type: String}
	],
	rented_properties: 
	[{
		until: {type: Date},
		property: {type: String},
		agreement: {type: String},
	}],
	agreements: 
	[
		{type: String}
	],
	companies: 
	[
		{type: String}
	],
	created_at: {type: Date, default: Date.now}
});