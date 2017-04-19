"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';
var Schema = mongoose.Schema;

var SubscribesSchema = new mongoose.Schema({
	email: {type: String, lowercase: true},	
	created_at: {type: Date, default: Date.now}
});

export default SubscribesSchema;