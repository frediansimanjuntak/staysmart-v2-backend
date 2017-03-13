"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var AgreementsSchema = new mongoose.Schema({
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
	appointment: {
		type: Schema.Types.ObjectId,
		ref: 'Appoinments'
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
				identity_front: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				},
				identity_back: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				}
			},
			tenant: {
				name: {type: String},
				type: {type: String},
				identification_number: {type: String},
				identity_front: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				},
				identity_back: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				}
			},
			gfd_amount: {type: Number},
			sd_amount: {type: Number},
			security_deposit: {type: Number},
			term_payment: {type: Number},
			minor_repair_cost: {type: Number},
			lapse_offer: {type: Number},
			term_lease_extend: {type: Number},
			appointment: {
				type: Schema.Types.ObjectId,
				ref: 'Appoinments'
			},
			property: {
				type: Schema.Types.ObjectId,
				ref: 'Properties'
			},
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
			payment: {
				type: Schema.Types.ObjectId,
				ref: 'Payments'
			},
			status: {
				type: String, 
				enum: ['pending', 'accepted', 'expired', 'landlord-confirmation', 'admin-confirmation']
			},
			created_at: {type: Date}
		},
		histories: 
		[{
			date: {type: Date},
			data: {}
		}]
	},
	tenancy_agreement: {
		data: {
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
			payment: {
				type: Schema.Types.ObjectId,
				ref: 'Payments'
			},
			status: {
				type: String, 
				enum: ['pending', 'accepted', 'expired', 'landlord-confirmation', 'admin-confirmation']
			},
			stamp_certificate: {
				type: Schema.Types.ObjectId,
				ref: 'Attachments'
			},
			created_at: {type: Date}
		},
		histories: 
		[{
			date: {type: Date},
			data: {}
		}]
	},
	inventory_list: {
		data: {
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
			status: {
				type: String,
				enum: ['pending', 'completed']
			},
			created_at: {type: Date},
			lists: [{
				name: {type: String},
				items: [{
					name: {type: String},
					quantity: {type: Number},
					remark: {type: String},
					attachments: [{
						type: Schema.Types.ObjectId,
						ref: 'Attachments'
					}],
					landlord_check: {type: Boolean},
					tenant_check: {type: Boolean}
				}]
			}]
		},
		histories: 
		[{
			date: {type: Date},
			data: {}
		}]
	}
});

export default AgreementsSchema;