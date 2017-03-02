"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';
import {AWSService} from '../../../../global/aws.service';

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

AttachmentsSchema.post('remove', function(removed){
  AWSService.delete(removed).then(res => {
    console.log(removed.name + ' removed from AWS');
  })
  .catch(err => {
    console.log(err);
    console.log('error when removing ' + removed.name + ' from AWS');
  })
});

export default AttachmentsSchema;