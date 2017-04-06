"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';
import Agreements from '../../agreements/dao/agreements-dao';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var AppointmentsSchema = new mongoose.Schema({
	room_id: {type: String},
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
	schedule: {
		type: String
	},
	chosen_time: {
		date: {type: String},
		from: {type: String},
		to: {type: String}
	},
	status: {
		type: String, 
		enum: ['pending','accepted','rejected','archived'], 
		default: 'pending'
	}
}, {
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
});

AppointmentsSchema
	.virtual('loi_status')
	.get(function() {
		Agreements
			.findOne({"property": this.property, "tenant": this.tenant})
			.exec((err, agreement) => {
				if(err) {
					return null;
				}
				else{
					if(agreement != null) {
						if(agreement.letter_of_intent) {
							if(agreement.letter_of_intent.data) {
								return agreement.letter_of_intent.data.status;
							}
							else{
								return null;
							}
						}
						else{
							return null;
						}
					}
					else{
						return null;
					}
				}
			})
	})

AppointmentsSchema
	.virtual('ta_status')
	.get(function() {
		Agreements
			.findOne({"property": this.property, "tenant": this.tenant})
			.exec((err, agreement) => {
				if(err) {
					return null;
				}
				else{
					if(agreement != null) {
						if(agreement.tenancy_agreement) {
							if(agreement.tenancy_agreement.data) {
								return agreement.tenancy_agreement.data.status;
							}
							else{
								return null;
							}
						}
						else{
							return null;
						}
					}
					else{
						return null;
					}
				}
			})
	})


export default AppointmentsSchema;