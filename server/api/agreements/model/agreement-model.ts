"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var AgreementSchema = new mongoose.Schema({
	room_id: {type: String},
	landlord: {type: String},
	tenant: {type: String},
	property: {type: String},
	appoinment: {
		type: Schema.Types.ObjectId,
		ref: 'Appoinment'
	},
	letter_of_intent: {
		data: {
			monthly_rental: {type: Number},
			term_lease: {type: Number},
			date_commencement: {type: Date},
			requirements: 
			[
				{type: String}
			],
			populate_tenant: {type: Boolean},
			landlord: {
				full_name: {type: String},
				type: {type: String},
				identification_number: {type: String},
				identity_front: {type: String},
				identity_back: {type: String}
			},
			tenant: {
				name: {type: String},
				type: {type: String},
				identification_number: {type: String},
				identity_front: {type: String},
				identity_back: {type: String}
			},
			gfd_amount: {type: Number},
			sd_amount: {type: Number},
			security_deposit: {type: Number},
			term_payment: {type: Number},
			minor_repair_cost: {type: Number},
			lapse_offer: {type: Number},
			term_lease_extend: {type: Number},
			appoinment: {
				type: Schema.Types.ObjectId,
				ref: 'Appoinment'
			},
			property: {
				_id: {type: String},
				development: {type: String, uppercase: true},
				address: {
					unit_no: {type: Number},
					unit_no_2: {type: Number},
					block_no: {type: Number},
					street_name: {type: String},
					postal_code: {type: Number},
					country: {type: String}
				},
				details: {
					furnishing: {type: String},
					price: {type: Number},
					size: {type: Number},
					size_sqm: {type: Number},
					psqft: {type: Number}
				}
			},
			version: {type: Number},
			confirmation: {
				tenant: {
					sign: {type: String},
					date: {type: Date},
					remarks: {type: String}
				},
				landlord: {
					sign: {type: String},
					date: {type: Date},
					remarks: {type: String}
				}
			},
			payment: {type: String},
			status: {type: String},
			created_at: {type: Date}
		},
		histories: 
		[{
			date: {type: Date},
			data: {}
		}]
	},
	tenancy_agreement: {},
	inventory_list: {}
});