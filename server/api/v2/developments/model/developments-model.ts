"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require ('crypto');

var Schema = mongoose.Schema;

var DevelopmentsSchema = new mongoose.Schema({
	name: {type: String, unique:false},
	slug: {type: String},
	number_of_units: {type: Number, default:0},
	properties: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Properties'
		}
	],
	tenure: {type:  String},
	age: {type: Number},
	planning_region: {type: String},
	planning_area: {type: String},
	type_of_area: {type: String},
	postal_district: {type: Number},
	address: {
	    block_number: {type: String},
	    street_name: {type: String},
	    postal_code: {type: String},
	    coordinates: [{type: String}], //longitude, latitude for radius query
	    country: {type: String},
	    full_address: {type: String},
	    type: {type: String} //default to Point
	},
	description: {type: String}
});

export default DevelopmentsSchema;