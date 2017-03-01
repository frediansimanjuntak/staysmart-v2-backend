"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var AttachmentsSchema = new mongoose.Schema({
	name: {type: String},
	key: {type: String},
	size: {type: String},
	type: {type: String},
	metadata: {},
	remarks: {type: String},
	uploaded_at: {type: Date, default: Date.now}
});

export default AttachmentsSchema;