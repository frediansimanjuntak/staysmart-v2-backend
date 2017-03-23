import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import chatsSchema from '../model/chats-model';
import Users from '../../users/dao/users-dao'
import Properties from '../../properties/dao/properties-dao'
import {DreamTalk} from '../../../../global/chat.service';

chatsSchema.static('requestToken', (userId:string, username:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

    	Users
    		.findById(userId)
    		.select({"dreamtalk": {$slice: -1}})
    		.exec((err, res) => {
    			var last_dreamtalk_data = res.dreamtalk;
    			for(var i = 0; i < last_dreamtalk_data.length; i++){
    				var expire = last_dreamtalk_data[i].loginTokenExpires;
    				var today = new Date();
    				if(today > expire) {
    					DreamTalk.requestToken(userId, username).then(token => {
				        	var res_token = JSON.parse(token);
				        	var user_token = res_token.token;

				        	ChatRooms.login(user_token, userId, username).then(res => {
				        		resolve(res);
				        	});
				        });
    				}
    				else{
    					resolve(last_dreamtalk_data[i]);
    				}
    			}
    		})
    });
});

chatsSchema.static('login', (token:string, userId:string, username:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.login(token).then(result => {
        	if(result.res){
	        	var id = result.res.id;
	        	var token = result.res.token;
	        	var tokenExpires = result.res.tokenExpires;
	        	var pushObj = {$push:{}};
	        	pushObj.$push['dreamtalk'] = {'loginId': id, 'loginToken': token, 'loginTokenExpires': tokenExpires};
	        	Users
	        		.findByIdAndUpdate(userId, pushObj)
	        		.exec((err, result) => {
	        			(err) ? reject(err)
	        				  : resolve(result);
	        		})
	        	resolve({'loginId': id, 'loginToken': token, 'loginTokenExpires': tokenExpires});
        	}
        	else{
        		ChatRooms.requestToken(userId, username);
        	}
        });
    });
});

chatsSchema.static('requestPeer', (userId:string, roomName:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.requestPeer(userId, roomName).then(result => {
        	resolve(result);
        });
    });
});

chatsSchema.static('insertChatRoom', (user:Object, rooms:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.insertChatRoom(user, rooms).then(result => {
        	resolve(result.res);
        });
    });
});

chatsSchema.static('createRoom', (uid:Object, name:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
    	Properties
    		.findById(name, (err, property) => {
    			var members = [];
    			members.push(property.owner.user);
    			if(property.manager){
    				members.push(property.manager);	
    			}
    			console.log(members);
    		
		    	ChatRooms
		    		.findOne({"tenant": uid, "propertyId": name}, (err, result) => {
		    			if(!result){
		    				DreamTalk.createRoom(uid, name, members).then(result => {
					        	if(result.res.message){
					        		resolve(result.res);
					        	}
					        	else{
					        		let room = JSON.parse(result.res.body);
					        		var _chat_rooms = new ChatRooms();
					        			_chat_rooms.room_id = room._id;
					                    _chat_rooms.property_id = name;
					                    _chat_rooms.landlord = property.owner.user;
                                        if(members.length > 1) {
                                            _chat_rooms.manager = property.manager;    
                                        }
					                    _chat_rooms.tenant = uid;
					                    _chat_rooms.save((err, saved)=>{
					                        if(err){
					                            reject(err);
					                        }
					                        else if(saved){
					                            console.log(saved);
					                            Users
					                                .findByIdAndUpdate(uid, {
					                                    $push: {
					                                        "chat_rooms": saved._id
					                                    }
					                                })
					                                .exec((err, users) => {
					                                    err ? reject(err)
					                                        : resolve(users);
					                                });
				                            
			                            		Users
					                                .findByIdAndUpdate(property.owner.user, {
					                                    $push: {
					                                        "chat_rooms": saved._id
					                                    }
					                                })
					                                .exec((err, users) => {
					                                    err ? reject(err)
					                                        : resolve(users);
					                                });	
			                            	    if(members.length > 1) {
                                                    Users
                                                        .findByIdAndUpdate(property.manager, {
                                                            $push: {
                                                                "chat_rooms": saved._id
                                                            }
                                                        })
                                                        .exec((err, users) => {
                                                            err ? reject(err)
                                                                : resolve(users);
                                                        });
                                                }
                                            }
					                    });
					        	}
					        });
		    			}
		    			else{
		    				resolve(result);
		    			}
		    		})
	    	})
    });
});

chatsSchema.static('getUserRoom', (userId:string, roomName:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.getUserRoom(userId, roomName).then(result => {
        	resolve(result);
        });
    });
});

chatsSchema.static('getSupportRooms', (roomName:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.getSupportRooms(roomName).then(result => {
        	resolve(result);
        });
    });
});

chatsSchema.static('getMembers', (roomId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.getMembers(roomId).then(result => {
        	resolve(result);
        });
    });
});

chatsSchema.static('postMembers', (roomId:string, memberId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.postMembers(roomId, memberId).then(result => {
        	if(result.res.message){
        		resolve({message: result.res.message});
        	}
        	else{
        		resolve(JSON.parse(result.res.body));	
        	}
        });
    });
});
//--
chatsSchema.static('postAnswer', (id:string, userId:string, option:number):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.postAnswer(id, userId, option).then(result => {
        	resolve(result);
        });
    });
});

chatsSchema.static('updateProfile', (data:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.updateProfile(data).then(result => {
        	resolve(result);
        });
    });
});

chatsSchema.static('updateRoom', (roomId:string, extra:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.updateRoom(roomId, extra).then(result => {
        	resolve(result);
        });
    });
});

let ChatRooms = mongoose.model('ChatRooms', chatsSchema);

export default ChatRooms;