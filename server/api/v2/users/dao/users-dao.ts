import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import usersSchema from '../model/users-model';
import Agreements from '../../agreements/dao/agreements-dao'
import Attachments from '../../attachments/dao/attachments-dao'
import Banks from '../../banks/dao/banks-dao'
import Companies from '../../companies/dao/companies-dao'
import Properties from '../../properties/dao/properties-dao'
import {EmailService} from '../../../../global/email.service'
import {SMS} from '../../../../global/sms.service'
import {signToken} from '../../../../auth/auth-service';
import {mail} from '../../../../email/mail';
import config from '../../../../config/environment/index';
import {GlobalService} from '../../../../global/global.service';

usersSchema.static('index', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users
			.find({}, '-salt -password')
			.exec((err, users) => {
				err ? reject(err)
				: resolve(users);
			});
	});
});

usersSchema.static('getAll', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {};

		Users
			.find(_query)
			.populate("picture tenant.data.identification_proof.front tenant.data.identification_proof.back tenant.data.bank_account.bank landlord.data.identification_proof.front landlord.data.identification_proof.back landlord.data.bank_account.bank owned_properties rented_properties.$.property rented_properties.$.agreement agreements companies")
			.exec((err, users) => {
				err ? reject(err)
				: resolve(users);
			});
	});
});

usersSchema.static('me', (userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users
			.findOne({_id:userId}, '-salt -password')
			.populate("picture tenant.data.identification_proof.front tenant.data.identification_proof.back tenant.data.bank_account.bank landlord.data.identification_proof.front landlord.data.identification_proof.back landlord.data.bank_account.bank owned_properties rented_properties.$.property rented_properties.$.agreement agreements companies")
			.populate({
	          path: 'tenant.chat_rooms',
	          populate: [{
	            path: 'propertyId',
	            model: 'Properties',
	            select: 'address'
	          },{
	            path: 'landlord',
	            model: 'Users',
	            select: 'landlord.data'
	          }],
	        })
	        .populate({
	          path: 'landlord.chat_rooms',
	          populate: [{
	            path: 'propertyId',
	            model: 'Properties',
	            select: 'address'
	          },{
	            path: 'tenant',
	            model: 'Users',
	            select: 'tenant.data'
	          }],
	        })
			.exec((err, users) => {
				err ? reject(err)
				: resolve(users);
			});
	});
});

usersSchema.static('getById', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Users
			.findById(id, '-salt -password -blocked_users -dreamtalk -agreements -landlord -tenant -verification -role -__v')
			.populate("picture tenant.data.identification_proof.front tenant.data.identification_proof.back tenant.data.bank_account.bank landlord.data.identification_proof.front landlord.data.identification_proof.back landlord.data.bank_account.bank owned_properties rented_properties.$.property rented_properties.$.agreement agreements companies")
			.exec((err, users) => {
				err ? reject(err)
				: resolve(users);
			});
	});
});

usersSchema.static('searchUser', (search:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users
		.findOne({"username": search})
		.exec((err, users)=>{	
			let userData ={
				"username": users.username,
				"_id": users._id,
			}
			err ? reject(err)
              	: resolve(userData);
		})
	});
});

usersSchema.static('checkUserData', (search:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users
		.findOne({ $or: [{"username": search}, {"email": search}, {"phone": search}]})
		.exec((err, users)=>{	
			if(err) {
				reject(err);
			}
			else{
				if(users) {
					resolve({message: true});
				}
				else{
					resolve({message: false});
				}
			}
		})
	});
});

usersSchema.static('getPropertyNonManager', (userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users
			.findById(userId, '-salt -password -blocked_users -dreamtalk -agreements -landlord -tenant -verification -role -__v')
			.populate({
				path: 'owned_properties',
					populate: {
						path: 'pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen',
						model: 'Attachments',
						select: 'key'
					}
			})
			.exec((err, users) => {
				if(err) {
					reject(err);
				}
				else if(users) {
					let ownProperty = [].concat(users.owned_properties);
					// let managerProperty = users.owned_properties.manager;
					let property = [];

					for (var i = 0; i < ownProperty.length; i++){
						let own = ownProperty[i];
						let managerProperty = own.manager;
						if (!managerProperty){
							property.push(own);
						}	
					}
					resolve(property);
				}
			});
	});
});

usersSchema.static('createUser', (user:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(user)) {
			return reject(new TypeError('User is not a valid object.'));
		}	
		let body:any = user;
		let randomCode = Math.random().toString(36).substr(2, 6);

		var _user = new Users(user);
		if(body.role == 'admin') {
			_user.verification.verified = true,
			_user.verification.verified_date = new Date()
		}
		else{
			_user.verification.code = randomCode;
		}
		_user.save((err, saved)=>{
			if(err){
				reject(err);
			}
			else if(saved){
				resolve({userId: saved._id});
			}
		});
	});
});

usersSchema.static('signUp', (user:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(user)) {
			return reject(new TypeError('User is not a valid object.'));
		}	

		let randomCode = Math.random().toString(36).substr(2, 6);
		let body:any = user;

		var _user = new Users(user);
			_user.verification.code = randomCode;
			_user.verification.expires = new Date(+new Date() + 5*60*1000);
			_user.username = body.username;
			_user.email = body.email;
			_user.password = body.password;
			_user.phone = body.phone;
			_user.role = 'user';
			_user.save((err, saved)=>{
				if(err){
					reject(err);
				}
				else if(saved){
				 	var token = signToken(_user._id, _user.role, _user.username);
					var fullname = _user.username;
					var from = 'Staysmart';
					SMS.sendActivationCode(body.phone, randomCode);
					mail.signUp(_user.email, fullname, from).then(res => {
						resolve({res, userId: saved._id, token});
					})
				}
			});
	});
});

usersSchema.static('sendActivationCode', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		
		let randomCode = Math.random().toString(36).substr(2, 6);

		Users
			.update({"_id": id}, {
				$set: {
					"verification.expires" : new Date(+new Date() + 5*60*1000),
					"verification.code": randomCode
				}
			})
			.exec((err, update) => {
				if(err){
					reject(err);
				}
				else if(update){
					Users
						.findById(id, (err, user) => {
							SMS.sendActivationCode(user.phone, randomCode).then(res => {
								resolve({message: "code sent"});
							});
						})
				}
			});
	});
});

usersSchema.static('deleteUser', (id:string, currentUser:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Users.validateUser(id, currentUser).then(res => {
			if(res.message) {
				reject({message: res.message});
			}
			else if(res == true){
				Users
					.findByIdAndRemove(id)
					.exec((err, deleted) => {
						err ? reject(err)
						: resolve({message: 'user deleted'});
					});
			}
		});
	});
});

usersSchema.static('updateUser', (id:string, user:Object, currentUser:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(user)) {
			return reject(new TypeError('User is not a valid object.'));
		}
		Users.validateUser(id, currentUser).then(res => {
			if(res.message) {
				reject({message: res.message});
			}
			else if(res == true){
				let body:any = user;

				Users
					.findById(id, (err, user)=>{
						if(body.username) {
							user.username = body.username;
						}
						if(body.email) {
							user.email = body.email;
						}
						if(body.phone) {
							user.phone = body.phone;
						}
						if(body.picture) {
							user.picture = body.picture;
						}
						if(body.oldpassword) {
							if(user.password == user.encryptPassword(body.oldpassword)){
								if(body.newpassword){
									user.password = body.newpassword;
								}
								else{
									reject({message: 'no password'})
								}
							}
							else if(user.password != user.encryptPassword(body.oldpassword)){
								reject({message: 'wrong password'});
							}
						}
							            
						user.save((err, saved) => {
				        err ? reject(err)
				            : resolve({message: 'data updated'});
			    	    });
					})
			}
		});
	});
});

usersSchema.static('updateUserData', (id:Object, type:string, userData:Object, currentUser:string):Promise<any> =>{
	return new Promise((resolve:Function, reject:Function) => {
		Users.validateUser(id, currentUser).then(res => {
			if(res.message) {
				reject({message: res.message});
			}
			else if(res == true){
				var ObjectID = mongoose.Types.ObjectId;  
				let userObj = {$set: {}};
				
				for(var param in userData) {
					userObj.$set[type+'.data.'+param] = userData[param];
				}
				
				Users.createHistory(id, type).then(res => {
					Users
						.findByIdAndUpdate(id, userObj)
						.exec((err, update) => {
							err ? reject(err)
							: resolve({message: 'data updated.'});
						});
				});
			}
		});
	});
});

usersSchema.static('updateUserDataOwners', (id:string, ownerData:Object):Promise<any> =>{
	return new Promise((resolve:Function, reject:Function) => {
		if(!_.isString(id) && !_.isObject(ownerData)) {
			return reject(new TypeError('User data is not a valid object or id is not a valid string.'));
		}
		
		var ObjectID = mongoose.Types.ObjectId;  
		let body:any = ownerData;
		var type = 'landlord';

		Users.createHistory(id, type);

		for (var i = 0; i < body.owners.length; i++) {
			Users
				.findByIdAndUpdate(id, {
					$push: {
						"landlord.data.owners": body.owners[i]
					}
				})
				.exec((err, update) => {
					err ? reject(err)
					: resolve(update);
				});	
		}
	});
});

usersSchema.static('createHistory', (id:string, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let userOldData = type+'.data';
		
		Users
			.findById(id, userOldData, (err, usersData) => {
				let datas:any = usersData;
				if(type === 'tenant') {
					var history_data = datas.tenant.data;
				}
				else if(type === 'landlord'){
					var history_data = datas.landlord.data;
				}
				let historyData:any = history_data;

				if(historyData.name != null) {
					var historyObj = {$push: {}};
					historyObj.$push[type+'.histories'] = {"date": new Date(), "data": history_data};
					Users
						.findByIdAndUpdate(id, historyObj)
						.exec((err, saved) => {
							err ? reject(err)
							: resolve(saved);
						});

					var unsetObj = {$unset: {}};
					unsetObj.$unset[userOldData+'.name'] = "";
					unsetObj.$unset[userOldData+'.identification_type'] = "";
					unsetObj.$unset[userOldData+'.identification_number'] = "";
					unsetObj.$unset[userOldData+'.identification_proof'] = "";
					Users
						.findByIdAndUpdate(id, unsetObj)
						.exec((err, update) => {
							err ? reject(err)
							: resolve(update);
						});
				}
			})
	});
});

usersSchema.static('activationUser', (id:string, user:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let body:any = user;

		Users
			.findById(id, (err,user)=>{
				var code = user.verification.code;
					
				if (code == body.code){
					if(user.verification.expires > new Date()) {
						Users
							.update({"_id": id},{
								$set:
								{
									"verification.verified": true, 
									"verification.verified_date": new Date()
								}
							})
							.exec((err, update) => {
								err ? reject(err)
										: resolve({message: 'user verified.'});
							});
					}
					else{
						reject({message: 'Your code has expired.'});
					}	
				}
			})
		});
});

usersSchema.static('unActiveUser', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		Users
			.findByIdAndUpdate(id,{
				$set:{"verification.verified": false}
			})
			.exec((err, deleted) => {
				err ? reject(err)
					: resolve();
			});
	});
});

usersSchema.static('blockUser', (id:string, userId:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		if (!_.isObject(userId)) {
			return reject(new TypeError('User Id is not a valid object.'));
		}
		Users
			.findByIdAndUpdate(userId, {
				$push: {
					"blocked_users": id
				}
			})
			.exec((err, update) => {
				err ? reject(err)
					: resolve(update);
			});
	});
});

usersSchema.static('unblockUser', (id:string, userId:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		if (!_.isObject(userId)) {
			return reject(new TypeError('User Id is not a valid object.'));
		}
		Users
			.findByIdAndUpdate(userId, {
				$pull: {
					"blocked_users": id
				}
			})
			.exec((err, update) => {
				err ? reject(err)
					: resolve(update);
			});
	});
});

usersSchema.static('sendResetPassword', (email:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(email)) {
			return reject(new TypeError('Email is not a valid string.'));
		}
		var randomToken = Math.random().toString(36).substr(2, 30);
		var validateEmail = GlobalService.validateEmail(email);
		if(validateEmail == true) {
			Users
				.update({"email": email}, {
					$set: {
						"reset_password.token": randomToken,
						"reset_password.created_at": new Date(),
						"reset_password.expired_at": new Date(+new Date() + 24*60*60*1000)
					}
				})
				.exec((err, update) => {
					if(err) {
						reject(err);
					}
					else if(update) {
						Users
							.findOne({email: email}, (err, result) => {
								if(result) {
									var fullname = result.username;
									var from = 'Staysmart';
									var url = config.url.reset_password+randomToken;
									mail.resetPassword(email, fullname, url, from);
									resolve({message: 'mail sent'});
								}
								else{
									resolve({message: 'no user registered with that email.'});
								}
							})
					}
				});
		}
		else{
			reject({message: 'Email not valid.'});
		}
	});
});

usersSchema.static('resetPassword', (token:string, newPassword:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(token)) {
			return reject(new TypeError('Link is not a valid string.'));
		}
		let body:any = newPassword;
		if(body.password === body.repassword){
			Users
				.findOne({"reset_password.token": token}, (err, result) => {
					if(result == null) {
						reject({message: 'You already reset your password.'});
					}
					else{
					 	var dateNow = new Date();
					 	if(dateNow < result.reset_password.expired_at) {
					 		result.password = body.password;
					 		result.save((err, saved)=>{
			        			err ? reject(err)
			        				: resolve(saved);
			        		})
			        		Users
			        			.update({"reset_password.token": token}, {
			        				$unset: {"reset_password": ""}
			        			})
			        			.exec((err, update) => {
									err ? reject(err)
										: resolve(update);
								});
					 	}
					 	else{
					 		reject({message: "Your link has expired."});
					 	}
					}
			 	})
		}
		else{
			reject({message: "Your password and repassword didn't match."});
		}
	});
});

usersSchema.static('validateUser', (userId:string, currentUser: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users.findById(currentUser, (err, result) => {
			if(result.role != 'admin'){
				if(userId != currentUser) {
					resolve({message: "Forbidden"});
				}		
				else{
					resolve(true);
				}
			}
		})
	});
});

let Users = mongoose.model('Users', usersSchema);

export default Users;