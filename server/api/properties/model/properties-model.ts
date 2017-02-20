"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var PropertiesSchema = new mongoose.Schema({
	development: {type:String, required: true, unique:true},
	address: {
		floor:{type: String},
		unit: {type: String},
		block_number: {type: Number},
		street_name: {type: String},
		postal_code: {type: Number},
		coordinates: 
		[
		{type: String}
		],
		country: {type: String},
		full_address: {type: String},
		type: {type: String}
	},
	details: {
		size_sqf: {type: Number},
		size_sqm: {type: Number},
		bedroom: {type: Number},
		bathroom: {type: Number},
		price: {type: Number},
		psqft: {type: Number},
		price: {type: Number},
		price_psm: {type: Number},
		price_psf: {type: Number},
		available: {type: Date},
		furnishing: {type: String},
		description: {type: String},
		type: {type: String},
		sale_date: {type: Date},
		property_type: {type: String},
		tenure: {type: String},
		completion_date: {type: Date},
		type_of_sale: {type: String},
		purchaser_address_indicator: {type: String},
		planning_region: {type: String},
		planning_area: {type: String}
	},
	amenities:
	[
	{type: String}
	],
	pictures:{
		living:
		[
		{type: String, unique: true}
		],
		dining:
		[
		{type: String, unique: true}
		],
		bed:
		[
		{type: String, unique: true}
		],
		toilet:
		[
		{type: String, unique: true}
		],
		kitchen:
		[
		{type: String, unique: true}
		]
	},
	owned_type: {type: String, enum:['individual', 'company']},
	owner: {
		user: {type: String, unique: true},
		company: {type: String, unique: true},
		shareholder: 
		[
			{
				name: {type: String},
				identification_type: {type: String},
				identification_number: {type: String},
				identification_proof: 
				{
					front: {type: String},
					back: {type: String}
				},
			}
		]
	},
	publish: {type: Boolean},
	confirmation: {
		status: {type: String, enum:['approved','rejected','pending']},
		proof: {type: String},
		by: {type: String},
		date: {type: Date}
	},
	status: {type: String, enum:['initiated','published','rented']},
	histories: 
	[{
		action: {type: String, enum:['remove','update']},
		date: {type: Date},
		data: {}
	}],
	created_at: {type: Date}
});