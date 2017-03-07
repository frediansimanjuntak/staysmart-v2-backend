'use strict';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import config from '../config/environment/index';

var DDPClient = require('ddp');

export class DDPConfig{
	static init():void {
		let headers = {
	      'X-Client-ID': 'xyb6HBZQK8Jq2YX3h',
	      'X-Client-Secret': 'pGnYqGHHdvoy4NOyDzXH6VW7rIjd-evVxnjgotH8',
	      'Content-Type': 'application/json',
	    }

	    let ddp = new DDPClient({
	      autoReconnect : true,
	      autoReconnectTimer : 500,
	      ddpVersion : '1',
	      url: config.dreamTalk
	    });

	    ddp.connect((err, wasReconnect) => {
	      if (err) {
	        console.log("DDP connection error: "+err);
	      }
	      if (wasReconnect) {
	        console.log("Reestablishment of connection");
	      }
	    });
	    ddp.on('message', function (msg) {
	      console.log("ddp message: " + msg);
	    });
	}
}