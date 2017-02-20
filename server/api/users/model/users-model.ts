"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var UsersSchema = new mongoose.Schema({
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
				front: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				},
				back: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				}
			},
			bank_account: {
				bank: 
				{
					type: Schema.Types.ObjectId,
					ref: 'Banks'
				},
				name: {type: String},
				no: {type: Number}
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
				front: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				},
				back: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				}
			},
			company: 
			{
				type: Schema.Types.ObjectId,
				ref: 'Companies'
			},
			bank_account: {
				bank: 
				{
					type: Schema.Types.ObjectId,
					ref: 'Banks'
				},
				name: {type: String},
				no: {type: Number}
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
		{
			type: Schema.Types.ObjectId,
			ref: 'Properties'
		}
	],
	rented_properties: 
	[{
		until: {type: Date},
		property: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Properties'
		},
		agreement: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Agreements'
		},
	}],
	agreements: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Agreements'
		}
	],
	dreamtalk:
	[{
		loginToken: {type: String},
		loginTokenExpires: {type: Date}
	}],
	companies: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Companies'
		}
	],
	created_at: {type: Date, default: Date.now}
});

export default UsersSchema;