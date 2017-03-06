"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var PropertiesSchema = new mongoose.Schema({
	development: {type:String},
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
		type: {type: String, default: "Point"}
	},
	details: {
		size_sqf: {type: Number},
		size_sqm: {type: Number},
		bedroom: {type: Number},
		bathroom: {type: Number},
		price: {type: Number},
		psqft: {type: Number},
		psqm: {type: Number},
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
	schedules: 
	[
		{
			day: {type: String},
			start_date: {type: Date},
			time_from: {type: String},
			time_to: {type: String}
		}
	],
	amenities:
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Amenities'
		}
	],
	pictures:{
		living:
		[
			{
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
			}
		],
		dining:
		[
			{
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
			}
		],
		bed:
		[
			{
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
			}
		],
		toilet:
		[
			{
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
			}
		],
		kitchen:
		[
			{
			type: Schema.Types.ObjectId,
			ref: 'Attachments'
			}
		]
	},
	owned_type: {type: String, enum:['individual', 'company']},
	owner: {
		user: 	
			{
				type: Schema.Types.ObjectId,
				ref: 'Users'
			},
		company: 
			{
				type: Schema.Types.ObjectId,
				ref: 'Companies'
			},
		shareholder: 
		[
			{
				name: {type: String},
				identification_type: {type: String},
				identification_number: {type: String},
				identification_proof: 
				{
					front: 
						{
							type: Schema.Types.ObjectId,
							ref: 'Attachments'
						},
					back: 
						{
							type: Schema.Types.ObjectId,
							ref: 'Attachments'
						}
				},
			}
		]
	},
	publish: {type: Boolean},
	confirmation: {
		status: {type: String, enum:['approved','rejected','pending'], default: 'pending'},
		proof: {type: String},
		by: 
			{
				type: Schema.Types.ObjectId,
				ref: 'Users'
			},
		date: {type: Date}
	},
	status: {type: String, enum:['initiated','published','rented','draft'], default: 'published'},
	histories: 
	[{
		action: {type: String, enum:['remove','update']},
		date: {type: Date},
		data: {}
	}],
	created_at: {type: Date}
});

export default PropertiesSchema;