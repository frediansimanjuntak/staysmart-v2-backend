"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var CompaniesSchema = new mongoose.Schema({
	name: {type: String},
	registeration_number: {type: String},
	document: 
	[
	{type: String}
	],
	created_by: {type: String},
	created_at: {type: Date}
});