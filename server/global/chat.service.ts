'use strict';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as request from 'request';
import config from '../config/environment/index';
import Users from '../api/v2/users/dao/users-dao';

var DDPClient = require('ddp');
var headers = {
	'X-Client-ID': 'b6xW7APE2FXmtBAyg',
	'X-Client-Secret': 'Gdgu2ZyCNktSPopKdMC1Db22FDjeDgoW02sAfZpG',
	'Content-Type': 'application/json'
};
var ddp = new DDPClient({
	autoReconnect : true,
	autoReconnectTimer : 500,
	maintainCollections : true,
	ddpVersion : '1', 
	url: config.dream_talk.ws
});

export class DreamTalk{
	static init():void{
		DreamTalk.connect();
	}

	static connect():void{
		ddp.connect((err, wasReconnect) => {
			if (err) {
				console.log("DDP connection error: "+err);
			}
			if (wasReconnect) {
				console.log("Reestablishment of connection");
			}
			DreamTalk.lastChatSubscribe();
		})
		ddp.on('message', function (msg) {
	      console.log("ddp message: " + msg);
	    });
	}

	static lastChatSubscribe():void{
		ddp.subscribe(
	      'organizations.chats.last',
	      [
	        {
	          clientId: headers['X-Client-ID'],
	          clientSecret: headers['X-Client-Secret']
	        }
	      ],
	      () => {
	        console.log('subscribed');
	      }
	    );
	    DreamTalk.observeChanges();
	}

	static observeChanges():void{
		return new Promise((resolve:Function, reject:Function) => {
			let observer = ddp.observe('chats');
			observer.added = function(id) {
				let chat = ddp.collections.chats[id];
				let room = ddp.collections.rooms[chat.roomId];
				if (!room){
					resolve({message : "room error"})
				}
				console.log('chat added', chat);
				const from = Users.findById(chat.uid);
				console.log('from user', from);
				if (!from){
					resolve({message : "from error"})
				}
				const name = from.name || '-';
				const roomMembers = [];
				for (let i in ddp.collections['roomMembers']) {
					const rm = ddp.collections['roomMembers'][i];
					if (rm.roomId === chat.roomId) {
					  roomMembers.push(rm);
					}
				}
				console.log('roomMembers', roomMembers);
				let message = chat.message;
				if (chat.type === 'image') {
					message = 'sent you an image';
					} else if (chat.type === 'options') {
					message = 'sent you a question';
				}
				const memberUids = [];
				for (let i in roomMembers) {
					const member = roomMembers[i];
					if (member.uid !== chat.uid) {
					  memberUids.push(member.uid);
					}
				}
				console.log('member ids', memberUids);
			}; 
		})		
	}
	static doHTTP(method, url, data) {
		if (!url) throw "Url not defined";
		let options = { method:'GET' };
		options["headers"] = headers;
		if (method) options.method = method;
		options["url"] = config.dream_talk.ws + url;
		if (method == 'GET' && data) {
		  options["qs"] = data;
		} else if (data) {
		  options["body"] = JSON.stringify(data);
		}
		return new Promise((resolve, reject) => {
		  request(options, function(err, res, body) {
		    if (err) {
		      reject(err);
		    }
		    if (res && (res.statusCode >= 200 && res.statusCode < 400)) {
		      try {
		        resolve(JSON.parse(body));
		      } catch (e) {
		        resolve(body)
		      }
		    } else {
		      try {
		        resolve(JSON.parse(body));
		      } catch (e) {
		        resolve(body)
		      }
		    }
		  });
		});
	}

	static requestToken(uid, name):void {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('GET', '/users/token', {uid, name})
			.then(res => {
			resolve(res)
			})
			.catch(err => {
			reject(err);
			});
		});
	}

	static login(token):void {
		return new Promise((resolve:Function, reject:Function) => {
			ddp.call(
				'login',
				[{resume: token}],
				(err, res) => {
				  if (err) reject(err);
				  else resolve(res);
				}
			);
	    });
	}

	static requestPeer(uid) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('GET', '/room', {uid, name: 'Peer Support'})
			.then(res => {
				resolve(res)
			})
			.catch(err => {
				reject(err)
			});
		});
	}

	static insertChatRoom(user, rooms) {
		console.log('insert to chat room');
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('POST', '/rooms/bulk_insert', {
				user,
				rooms
			})
			.then(res => {
				console.log('insert to chat room success');
				resolve(res)
			})
			.catch(err => {
				reject(err)
			})
		});
	}

	static getUserRoom(uid) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('GET', '/rooms/users', {
				uid,
				name: 'Nutritionist Support'
			})
			.then(res => {
				resolve(res)
			})
			.catch(err => {
				reject(err)
			})
		});
	}

	static getSupportRooms() {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('GET', '/rooms', {
				name: 'Nutritionist Support'
			})
			.then(res => {
				resolve(res)
			})
			.catch(err => {
				reject(err)
			});
		});
	}

	static getMembers(roomId) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('GET', '/rooms/members', {
				roomId
			})
			.then(res => {
				resolve(res)
			})
			.catch(err => {
				reject(err)
			})
		});
	}

	static postMembers(roomId, uid) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('POST', '/rooms/members', {
				roomId,
				uid
			})
			.then(res => {
				resolve(res);
			})
			.catch(err => {
				reject(err);
			});
		});
	}

	static postAnswer(id, uid, option) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('POST', '/chats/option', {
				id, uid, option
			})
			.then(res => {
				resolve(res);
			})
			.catch(err => {
				reject(err);
			});
		});
	}

	static updateProfile(data) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('POST', '/users/profile', data)
			.then(res => {
				resolve(res);
			})
			.catch(err => {
				reject(err);
			});
		});
	}

	static updateRoom(roomId, extra) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('PUT', '/room', {
				roomId, extra
			})
			.then(res => {
				resolve(res);
			})
			.catch(err => {
				reject(err);
			})
		});
	}
}

export default DreamTalk;
