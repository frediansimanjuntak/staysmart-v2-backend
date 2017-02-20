"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require ('crypto');

var Schema = mongoose.schema;

var DevelopmmentSchema = new mongoose.schema({
	name: {type: String, uppercase: true, unique: true, required: true },
	number of units: {type: Number, required: true},
	properties: 
	[
		{type: String, unique: true, required: true}
	],
	tenure: {type:  String, lowercase: true, required: true},
	age: {type: Number, required: true},
	planning_region: {type: String, required: true},
	planning_area: {type: String, required: true},
	type_of_area: {type: String, required: true},
	postal_district: {type: Number, required: true}
});