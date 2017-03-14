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
			monthly_rental: {type: String},
			term_lease: {type: String},
			date_commencement: {type: Date},
			requirements: 
			[
				{type: String}
			],
			populate_tenant: {type: Boolean},
			landlord: {
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
				}
			},
			tenant: {
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
				}
			},
			occupiers: {
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
				}
			},
			gfd_amount: {type: String},
			sd_amount: {type: String},
			security_deposit: {type: String},
			term_payment: {type: String},
			minor_repair_cost: {type: String},
			lapse_offer: {type: String},
			term_lease_extend: {type: String},
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
				enum: ['pending', 'accepted', 'expired', 'landlord-confirmation', 'admin-confirmation', 'rejected']
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
				enum: ['pending', 'accepted', 'expired', 'landlord-confirmation', 'admin-confirmation', 'rejected']
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
				enum: ['pending', 'completed'],
				default: 'pending'
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