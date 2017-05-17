'use strict';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as request from 'request';
import config from '../config/environment/index';
import Users from '../api/v2/users/dao/users-dao';

var DDPClient = require('ddp');
var headers = {
	'X-Client-ID': 'TLXyM7hgjPS5BXtPk',
	'X-Client-Secret': 'sc6zBzxb1XQ1H7BHRWKuhAYc_WsZ6mpOFu-gRDZB ',
	'Content-Type': 'application/json'
};
// var headers = {
// 	'X-Client-ID': 'xyb6HBZQK8Jq2YX3h',
// 	'X-Client-Secret': 'pGnYqGHHdvoy4NOyDzXH6VW7rIjd-evVxnjgotH8',
// 	'Content-Type': 'application/json'
// };
var ddp = new DDPClient({
	autoReconnect : true,
	autoReconnectTimer : 500,
	maintainCollections : true,
	ddpVersion : '1', 
	url: config.dream_talk.ws
});

export class DreamTalk{
	static init(){
		DreamTalk.connect();
	}

	static connect(){
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

	static lastChatSubscribe(){
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

	static observeChanges(){
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
		let options = { method:'GET', headers: headers };
		if (method) options.method = method;
		options["url"] = config.dream_talk.url + url;
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
		      	resolve(res);
		        resolve(JSON.parse(body));
		      } catch (e) {
		        resolve(e)
		      }
		    } else {
		      try {
		        resolve(JSON.parse(body));
		      } catch (e) {
		        resolve(e)
		      }
		    }
		  });
		});
	}

	static requestToken(uid, name) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('GET', '/users/token', {uid, name})
			.then(res => {
			resolve(res.body)
			})
			.catch(err => {
			reject(err);
			});
		});
	}

	static login(token) {
		return new Promise((resolve:Function, reject:Function) => {
			ddp.call(
				'login',
				[{resume: token}],
				(err, res) => {
				  if (err) resolve({err});
				  else resolve({res});
				}
			);
	    });
	}

	static requestPeer(uid, name) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('GET', '/room', {uid, name})
			.then(res => {
				resolve(JSON.parse(res.body))
			})
			.catch(err => {
				reject(err)
			});
		});
	}

	static createRoom(uid, name, members, property_id, landlord, manager) {
		console.log('chat room created');
		return new Promise((resolve:Function, reject:Function) => {
			var extraField = {status: 'enquiries', properties_id: property_id, tenant: uid, landlord: landlord, manager: manager};
			DreamTalk.doHTTP('POST', '/rooms', {
				uid,
				name, 
				members,
				extra: extraField
			})
			.then(res => {
				console.log('create chat room success');
				resolve({res})
			})
			.catch(err => {
				reject(err)
			})
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
				resolve({res})
			})
			.catch(err => {
				reject(err)
			})
		});
	}

	static getUserRoom(uid, name) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('GET', '/rooms/users', {
				uid,
				name
			})
			.then(res => {
				resolve(JSON.parse(res.body))
			})
			.catch(err => {
				reject(err)
			})
		});
	}

	static getSupportRooms(name) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('GET', '/rooms', {
				name
			})
			.then(res => {
				resolve(JSON.parse(res.body))
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
				resolve(JSON.parse(res.body))
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
				resolve({res});
			})
			.catch(err => {
				reject({err});
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
				resolve(JSON.parse(res.body));
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
				resolve(JSON.parse(res.body));
			})
			.catch(err => {
				reject(err);
			})
		});
	}

	static deleteRoom(roomId, uid) {
		return new Promise((resolve:Function, reject:Function) => {
			DreamTalk.doHTTP('DELETE', '/rooms/members', {
				roomId, uid
			}) 
			.then(res => {
				resolve(JSON.parse(res.body));
			})
			.catch(err => {
				reject(err);
			})
		});
	}
}

export default DreamTalk;
