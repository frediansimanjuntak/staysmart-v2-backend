"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var PropertiesSchema = new mongoose.Schema({
	development: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Developments'
		},
	address: {
		floor:{type: String},
		unit: {type: String},
		block_number: {type: String},
		street_name: {type: String},
		postal_code: {type: Number},
		coordinates: 
			[
				{type: String}
			],
		country: {type: String, default: 'Singapore'},
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
		furnishing: {type: String, enum: ['fully','partially','unfurnished']},
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
			backup_id: {type: String},
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
			}
	},
	manager: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Users'
		},
	confirmation: {
		status: {type: String, enum:['approved','rejected','pending'], default: 'pending'},
		proof: 
			{
				type: Schema.Types.ObjectId,
				ref: 'Attachments'
			},
		by: 
			{
				type: Schema.Types.ObjectId,
				ref: 'Users'
			},
		date: {type: Date}
	},
	temp: {
		owner: 
        {
          name: {type: String},
          identification_type: {type: String},
          identification_number: {type: String},
          identification_proof: 
          {
            front: {
              type: Schema.Types.ObjectId,
              ref: 'Attachments'
            },
            back: {
              type: Schema.Types.ObjectId,
              ref: 'Attachments'
            }
          }
        },
		shareholders: 
		[
			{
				name: {type: String},
				identification_type: {type: String},
				identification_number: {type: String},
				identification_proof: 
				{
					front: {
						type: Schema.Types.ObjectId,
						ref: 'Attachments'
					},
					back: {
						type: Schema.Types.ObjectId,
						ref: 'Attachments'
					}
				}
			}
		],
	},
	status: {type: String, enum:['draft','published','initiated','rented'], default: 'published'},
	histories: 
	[{
		action: {type: String, enum:['remove','update']},
		date: {type: Date},
		data: {}
	}],
	created_at: {type: Date}
});

export default PropertiesSchema;