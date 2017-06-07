import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import chatsSchema from '../model/chats-model';
import Users from '../../users/dao/users-dao';
import Agreements from '../../agreements/dao/agreements-dao'
import Properties from '../../properties/dao/properties-dao';
import {DreamTalk} from '../../../../global/chat.service';

chatsSchema.static('getChatRooms', (query:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        ChatRooms
            .find(query)
            .populate("agreement")
            .populate({
                path: 'landlord',
                model: 'Users',
                populate: {
                  path: 'picture',
                  model: 'Attachments'
                },
                select: 'username email picture landlord.data'
            })
            .populate({
                path: 'tenant',
                model: 'Users',
                populate: {
                  path: 'picture',
                  model: 'Attachments'
                },
                select: 'username email picture landlord.data'
            })
            .populate({
                path: 'manager',
                model: 'Users',
                populate: {
                  path: 'picture',
                  model: 'Attachments'
                },
                select: 'username email picture landlord.data'
            })
            .populate({
                path: 'property',
                model: 'Properties',
                populate: {
                  path: 'development',
                  model: 'Developments'
                }
            })
            .exec((err, res) => {
                err ? reject({message: err.message})
                    : resolve(res);
            })
    });
});

chatsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};
        ChatRooms.getChatRooms(_query).then(res => {
            resolve(res);
        })
        .catch((err) => {
            reject({message: err.message});
        })
    });
});

chatsSchema.static('getById', (id:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        let _query = {"_id": id};
        let userIdStr = userId.toString();
        ChatRooms.getChatRooms(_query).then(res => {
            _.each(res, (chats) => {
                let type;
                let idCheck;
                let idUser;
                let landlord = chats.landlord._id;
                let tenant = chats.tenant._id;
                if(!chats.blocked){
                    if(landlord == userIdStr || tenant == userIdStr){
                        if(landlord == userIdStr){
                            type = "landlord";
                            idUser = landlord;
                            idCheck = tenant;
                        }
                        if(tenant == userIdStr){
                            type = "tenant";
                            idUser = tenant;
                            idCheck = landlord;
                        }
                        ChatRooms.checkBlock(idCheck, idUser).then((result)=> {
                            ChatRooms.updateBlockedChat(id, result.blocked).then((res)=> {
                                let _queryupdate = {"_id":res._id};
                                ChatRooms.getChatRooms(_queryupdate).then(chats => {
                                    _.each(chats, (data) => {
                                        resolve(data);
                                    })
                                })
                            })                        
                        })
                    }
                    else{
                        reject({message: "forbidden"});
                    }
                }
                else{
                    resolve(chats);
                }    
            })
        })
        .catch((err) => {
            reject({message: err.message});
        })
    });
});

chatsSchema.static('updateBlockedChat', (id:string, blocked:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        ChatRooms
            .findById(id)
            .exec((err, chatRoom) => {
                if(err){
                    reject(err);
                }
                if(chatRoom){
                    chatRoom.blocked = blocked;
                    chatRoom.save((err, saved)=> {
                        err ? reject({message: err.message})
                            : resolve(saved);
                    })
                }
            })
    });
});

chatsSchema.static('checkBlock', (idCheck:string, idUser:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Users
            .findById(idCheck)                    
            .exec((err, user) => {
                if(err){
                    reject(err);
                }
                if(user){
                    let block;
                    if(user.blocked_users.length == 0){
                        block = false
                    }
                    else{
                        for(var i = 0; i < user.blocked_users.length; i++){
                            let userBlock = user.blocked_users[i];
                            if(userBlock == idUser){
                                block = true;
                            }
                            else{
                                block = false;
                            }
                        }
                    }                    
                    resolve({blocked: block});
                }
            })
    });
});

chatsSchema.static('getByRoomId', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        let _query = {"room_id": id};
        ChatRooms.getChatRooms(_query).then(res => {
            _.each(res, (result) => {
                resolve(result);
            })
        })
        .catch((err) => {
            reject({message: err.message});
        })
    });
});

chatsSchema.static('getByUser', (userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        let _query = {$or: [{"tenant": userId},{"landlord":userId},{"manager":userId}] };
        ChatRooms.getChatRooms(_query).then(res => {
            resolve(res);
            // _.each(res, (result) => {
            //     resolve(result);
            // })
        })
        .catch((err) => {
            reject({message: err.message});
        })        
    });
});

chatsSchema.static('requestToken', (userId:string, username:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.requestToken(userId, username).then(token => {
            console.log(token);
            resolve(JSON.parse(token));
        });
    });
});

chatsSchema.static('login', (token:string, userId:string, username:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.login(token).then(result => {
            console.log(result);
        	if(result.res){
	        	var id = result.res.id;
	        	var tokenLogin = result.res.token;
	        	var tokenExpires = result.res.tokenExpires;
	        	var pushObj = {$push:{}};
	        	pushObj.$push['dreamtalk'] = {'loginId': id, 'loginToken': tokenLogin, 'loginTokenExpires': tokenExpires};
	        	Users
	        		.findByIdAndUpdate(userId, pushObj)
	        		.exec((err, result) => {
	        			if(err) {
                            reject({message: err.message});
                        }
                        else{
                            resolve({'loginId': id, 'loginToken': tokenLogin, 'loginTokenExpires': tokenExpires});            
                        }
	        		})
        	}
        	else if(result.err){
                console.log(result.err);
        		DreamTalk.requestToken(userId, username).then(tokenReq => {
                    var res_token = JSON.parse(tokenReq);
                    var user_token = res_token.token;

                    ChatRooms.login(user_token, userId, username).then(res => {
                        resolve(res);
                    });
                });
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

chatsSchema.static('createRoom', (uid:string, data:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let body:any = data;
        let propertyId = body.property_id;

        Properties
            .findById(propertyId)
            .exec((err, property) => {
                if(err){
                    reject({message: err.message});
                }
                if(property){
                    let landlordId = property.owner.user;
                    var members = [];
                    members.push(property.owner.user);
                    var manager = '';
                    if(property.manager){
                        members.push(property.manager);    
                        manager = property.manager;
                    }
                    ChatRooms
                        .findOne({"tenant": uid, "property": propertyId})
                        .exec((err, chats) => {
                            if(err){
                                reject(err);
                            }
                            else if(chats){
                                resolve(chats);
                            }
                            else{
                                let roomName = uid + '-' + property.owner.user + '-' + propertyId;
                                DreamTalk.createRoom(uid, roomName, members, propertyId, property.owner.user, manager)
                                .then((result) => {
                                    if(result.res.message){
                                        resolve({message: result.res});
                                    }
                                    else{
                                        let room = JSON.parse(result.res.body);
                                        var _chat_rooms = new ChatRooms();
                                        _chat_rooms.room_id = room._id;
                                        _chat_rooms.property = propertyId;
                                        _chat_rooms.landlord = property.owner.user;
                                        _chat_rooms.status = 'enquiries';
                                        if(members.length > 1) {
                                            _chat_rooms.manager = property.manager;    
                                        }
                                        _chat_rooms.tenant = uid;
                                        _chat_rooms.save((err, saved) => {
                                            if(err){
                                                reject(err);
                                            }
                                            if(saved){
                                                let agreementData = {
                                                    "property": saved.property,
                                                    "room": saved._id
                                                }
                                                Agreements.createAgreements(agreementData, uid.toString())
                                                .then((res) => {
                                                    let idAgreement = res._id;
                                                    saved.agreement = idAgreement;
                                                    saved.save((err, result) => {
                                                        if(err){
                                                            reject(err);
                                                        }
                                                        if(result){
                                                            let userIds = [];
                                                            userIds.push(uid);
                                                            userIds.push(property.owner.user);
                                                            if(members.length > 1) {
                                                                userIds.push(property.manager);
                                                            }
                                                            Users
                                                                .update({"_id": {$in: userIds}}, {
                                                                    $push: {
                                                                        "chat_rooms": saved._id
                                                                    }
                                                                }, {multi: true})
                                                                .exec((err, users) => {
                                                                    err ? reject({message: err})
                                                                        : resolve(result);
                                                                }); 
                                                        }
                                                    })
                                                })
                                                .catch((err) => {
                                                    reject(err);
                                                })                                                                                            
                                            }
                                        });
                                    }
                                })
                                .catch((err) => {
                                    reject(err);
                                })                                 
                            }
                        })
                }
            })
    });
});

chatsSchema.static('archivedRoom', (roomId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        ChatRooms
            .findByIdAndUpdate(roomId, {
                $set: {
                    archived: true
                }
            })
            .exec((err, chat_rooms) => {
                err ? reject({message: err.message})
                    : resolve({message: 'room updated'});
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
                ChatRooms
                    .find({"room_id": roomId})
                    .exec((err, chat_room) => {
                        if(err) {
                            reject({message: err.message});
                        }
                        else if(chat_room) {
                            for(var i = 0; i < chat_room.length; i++){
                                chat_room[i].manager = memberId;
                                chat_room[i].save((err, result) => {
                                    err ? reject({message: err.message})
                                        : resolve(result);
                                });
                            }
                        }
                    })
        	}
        });
    });
});

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

chatsSchema.static('updateRoom', (roomId:string, status:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var extra = {status: status};
        ChatRooms
            .findByIdAndUpdate(roomId, {
                $set: {
                    status: status
                }
            })
            .exec((err, chat_rooms) => {
                if(err) {
                    reject({message: err.message});
                }
                else if(chat_rooms) {
                    DreamTalk.updateRoom(roomId, extra);
                    resolve({message: 'room updated'});
                }
            })
    });
});

chatsSchema.static('deleteRoom', (roomId:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let idUser = userId.toString();
        ChatRooms
            .findById(roomId)
            .exec((err, chat_room) => {
                if(err){
                    reject(err);
                }
                if(chat_room){
                    let landlord = chat_room.landlord.toString();
                    let tenant = chat_room.tenant.toString();
                    let manager = chat_room.manager.toString();
                    if(landlord == idUser || tenant == idUser || manager == idUser) {
                        if(landlord){
                            DreamTalk.deleteRoom(roomId, landlord);
                        }
                        if(tenant){
                            DreamTalk.deleteRoom(roomId, tenant);
                        }
                        if(manager){
                            DreamTalk.deleteRoom(roomId, manager);
                        }
                        ChatRooms
                            .findByIdAndRemove(roomId)
                            .exec((err, result) => {
                                if(err) {
                                    reject({message: err.message});
                                }
                                else{
                                    resolve({message: 'chat room deleted.'});
                                }
                            })
                    }
                    else{
                        reject({message: 'you do not have access to this room.'});
                    }
                }                
            })
    });
});

chatsSchema.static('deleteRoomMany', (data:Object, role: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let body:any = data;
        for(var i = 0; i < body.ids.length; i++){
            let roomId = body.ids[i].toString();
            ChatRooms
            .findById(roomId)
            .exec((err, chat_room) => {
                if(err){
                    reject(err);
                }
                if(chat_room){
                    let landlord;
                    let tenant;
                    let manager;
                    if(chat_room.landlord){
                        landlord = chat_room.landlord.toString();
                    }
                    if(chat_room.tenant){
                        tenant = chat_room.tenant.toString();
                    }
                    if(chat_room.manager){
                        manager = chat_room.manager.toString();
                    }
                    if(role == "admin") {
                        if(landlord){
                            DreamTalk.deleteRoom(roomId, landlord);
                        }
                        if(tenant){
                            DreamTalk.deleteRoom(roomId, tenant);
                        }
                        if(manager){
                            DreamTalk.deleteRoom(roomId, manager);
                        }
                        ChatRooms
                            .findByIdAndRemove(roomId)
                            .exec((err, result) => {
                                if(err) {
                                    reject({message: err.message});
                                }
                                else{
                                    resolve({message: 'chat room deleted.'});
                                }
                            })
                    }
                    else{
                        reject({message: 'you do not have access to this room.'});
                    }
                }                
            })
        }        
    });
});

let ChatRooms = mongoose.model('ChatRooms', chatsSchema);

export default ChatRooms;