import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import chatsSchema from '../model/chats-model';
import Users from '../../users/dao/users-dao'
import {DreamTalk} from '../../../../global/chat.service';

chatsSchema.static('requestToken', (userId:string, username:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
    	var user_id = userId.toString();
    	Users
    		.findById(userId)
    		.select({"dreamtalk": {$slice: -1}})
    		.exec((err, res) => {
    			var last_dreamtalk_data = res.dreamtalk;
    			for(var i = 0; i < last_dreamtalk_data.length; i++){
    				var expire = last_dreamtalk_data[i].loginTokenExpires;
    				var today = new Date();
    				if(today > expire) {
    					DreamTalk.requestToken(user_id, username).then(token => {
				        	var res_token = JSON.parse(token);
				        	var user_token = res_token.token;

				        	Chats.login(user_token, user_id, username).then(res => {
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
        		Chats.requestToken(userId, username);
        	}
        });
    });
});

chatsSchema.static('requestPeer', (userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        DreamTalk.requestPeer(userId).then(result => {
        	console.log(result);
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


let Chats = mongoose.model('Chats', chatsSchema);

export default Chats;