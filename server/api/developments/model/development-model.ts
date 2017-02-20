"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require ('crypto');

var Schema = mongoose.Schema;

var DevelopmmentSchema = new mongoose.Schema({
	name: {type: String, unique: true, required: true },
	slug: {type: String},
	number of units: {type: Number},
	properties: 
	[
		{type: String, unique: true}
	],
	tenure: {type:  String},
	age: {type: Number},
	planning_region: {type: String},
	planning_area: {type: String},
	type_of_area: {type: String},
	postal_district: {type: Number, required: true}
});