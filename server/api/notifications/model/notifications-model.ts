"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;

var NotificationsSchema = new mongoose.Schema({
	user: {type: String},
	message: {type: String},
	type: {type: String},
	ref_id: {type: String},
	read_at: {type: Date},
	clicked: {type: Boolean},
	created_at: {type: Date}
});