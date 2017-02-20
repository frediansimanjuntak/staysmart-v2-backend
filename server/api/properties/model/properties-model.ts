"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.schema;

var PropertiesSchema = new mongoose.schema({
	development: {type:String, required: true, unique:true},
	address: {
		unit_no:{type: Number, required: true},
		unit_no_2: {type: Number, required: true},
		block_no: {type: Number, required: true},
		street_name: {type: String, required: true},
		postal_code: {type: Number, required: true},
		coordinates: 
		[
		{type: Number, unique: true, required: true}
		],
		country: {type: String, required: true},
		full_address: {type: String, require: true},
		type: {type: String, required: true}
	},
	details: {
		size_sqf: {type: Number, required: true},
		size_sqm: {type: Number, required: true},
		bedroom: {type: Number, required: true},
		bathroom: {type: Number, required: true},
		price: {type: Number, require: true},
		psqft: {type: Number, required: true},
		price: {type: Number, required: true},
		price_psm: {type: Number, required: true},
		price_psf: {type: Number, required: true},
		available: {type: Date, required: true},
		furnishing: {type: String, required: true},
		description: {type: String},
		type: {type: String, required: true},
		sale_date: {type: Date, required: true},
		property_type: {type: String, required: true},
		tenure: {type: String, required: true},
		completion_date: {type: Date, required: true},
		type_of_sale: {type: String, required: true},
		purchaser_address_indicator: {type: String, required: true},
		planning_region: {type: String, required: true},
		planning_area: {type: String, required: true}
	},
	amenities:
	[
	{type: String, unique: true, required: true}
	],
	pictures:{
		living:
		[
		{type: String, unique: true, required: true}
		],
		dining:
		[
		{type: String, unique: true, required: true}
		],
		bed:
		[
		{type: String, unique: true, required: true}
		],
		toilet:
		[
		{type: String, unique: true, required: true}
		],
		kitchen:
		[
		{type: String, unique: true, required: true}
		]
	},
	owned_type: {type: String, enum:['individual', 'company']},
	owner: {
		user: {type: String, unique: true},
		company: {type: String, unique: true}
	},
	publish {type: Boolean},
	confirmation: {
		status: {type: String, enum:['approved','rejected','pending']},
		proof: {type: String, required: true},
		by: {type: String, required: true},
		date: {type: Date, required: true}
	},
	status: {type: String, enum:['initiated','published','rented']},
	histories: 
	[{
		action: {type: String, enum:['remove','update']},
		date: {type: Date, required: true},
		data: {type: String, required: true}
	}],
	created_at: {type: Date, required: true}
});