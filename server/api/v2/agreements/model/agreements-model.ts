"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var AgreementsSchema = new mongoose.Schema({
	room: {
		type: Schema.Types.ObjectId,
		ref: 'ChatRooms'
	},
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
		ref: 'Appointments'
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
			occupiers: [{
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
			}],
			gfd_amount: {type: Number},
			sd_amount: {type: Number},
			security_deposit: {type: Number},
			term_payment: {type: Number},
			minor_repair_cost: {type: Number},
			lapse_offer: {type: Number},
			term_lease_extend: {type: Number},
			appointment: {
				type: Schema.Types.ObjectId,
				ref: 'Appointments'
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
				enum: ['draft', 'pending', 'payment-confirmed', 'accepted', 'rejected', 'expired']
			},
			tenant_seen : {
				type: Boolean,
				default: false
			},
			landlord_seen : {
				type: Boolean,
				default: false
			},
			created_at: {type: Date}
		},
		histories: 
		[{
			delete: {type: Boolean, default: false},
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
				enum: ['pending', 'accepted', 'expired', 'admin-confirmation', 'payment-confirmed', 'rejected']
			},
			stamp_certificate: {
				type: Schema.Types.ObjectId,
				ref: 'Attachments'
			},
			tenant_seen : {
				type: Boolean,
				default: false
			},
			landlord_seen : {
				type: Boolean,
				default: false
			},
			created_at: {type: Date}
		},
		histories: 
		[{
			delete: {type: Boolean, default: false},
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
			property: {type:String},
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
					row_id: {type: String},
					landlord_check: {type: Boolean},
					tenant_check: {type: Boolean}
				}]
			}]
		},
		histories: 
		[{
			delete: {type: Boolean, default: false},
			date: {type: Date},
			data: {}
		}]
	}
});

export default AgreementsSchema;