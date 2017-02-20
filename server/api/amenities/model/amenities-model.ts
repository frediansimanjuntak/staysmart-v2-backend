"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var AmenitiesSchema = new mongoose.Schema({
	name: {type: String},
	description: {type: String},
	created_at: {type: Date, default: Date.now}
});

export default AmenitiesSchema;