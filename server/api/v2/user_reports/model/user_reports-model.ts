"use strict";

import * as mongoose from 'mongoose';
var Schema = mongoose.Schema;

var UserReportsSchema = new mongoose.Schema({
	reporter: 
	{
		type: Schema.Types.ObjectId,
		ref: 'Users'	
	},
	reported: 
	{
		type: Schema.Types.ObjectId,
		ref: 'Users'	
	},
	reason: {type: String},
	created_at: {type: Date, default: Date.now}
});

export default UserReportsSchema;