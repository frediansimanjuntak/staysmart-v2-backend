import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import usersSchema from '../model/users-model';
import Agreements from '../../agreements/dao/agreements-dao'
import Attachments from '../../attachments/dao/attachments-dao'
import Banks from '../../banks/dao/banks-dao'
import Companies from '../../companies/dao/companies-dao'
import ChatRooms from '../../chats/dao/chats-dao'
import Properties from '../../properties/dao/properties-dao'
import Managers from '../../managers/dao/managers-dao'
import {EmailService} from '../../../../global/email.service'
import {SMS} from '../../../../global/sms.service'
import {signToken} from '../../../../auth/auth-service';
import {mail} from '../../../../email/mail';
import config from '../../../../config/environment/index';
import {GlobalService} from '../../../../global/global.service';
import {socketIo} from '../../../../server';
import {userHelper} from '../../../../helper/user.helper';
var split = require('split-string');
var jwtDecode = require('jwt-decode');
var FB = require('fb');

usersSchema.static('index', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users
			.find({})
			.exec((err, users) => {
				err ? reject({message: err.message})
				: resolve(users);
			});
	});
});

usersSchema.static('getUser', (query:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {

		Users
			.find(query)
			.populate("picture tenant.data.identification_proof.front tenant.data.identification_proof.back tenant.data.bank_account.bank landlord.data.identification_proof.front landlord.data.identification_proof.back landlord.data.bank_account.bank landlord.data.owners.identification_proof.front landlord.data.owners.identification_proof.back blocked_users")
			.populate({
				path: 'companies',
				populate: [{
					path: 'documents',
					model: 'Attachments'
				},
				{
					path: 'shareholders.identification_proof.front',
					model: 'Attachments'
				},
				{
					path: 'shareholders.identification_proof.back',
					model: 'Attachments'
				}]
			})
			.populate({
	          path: 'chat_rooms',
	          populate: [{
	            path: 'property',
	            model: 'Properties',
	            select: 'address'
	          },
	          {
	            path: 'landlord',
	            model: 'Users',
	            select: 'landlord.data'
	          },
	          {
	            path: 'tenant',
	            model: 'Users',
	            select: 'tenant.data'
	          }],
	        })
	        .populate({
				path: 'owned_properties',
				populate: [{
					path: 'development',
					model: 'Developments'
				},
				{
					path: 'pictures.kitchen',
					model: 'Attachments'
				},
				{
					path: 'pictures.toilet',
					model: 'Attachments'
				},
				{
					path: 'pictures.bed',
					model: 'Attachments'
				},
				{
					path: 'pictures.dining',
					model: 'Attachments'
				},
				{
					path: 'pictures.living',
					model: 'Attachments'
				},
				{
					path: 'amenities',
					model: 'Amenities',
					populate: {
						path: 'icon',
						model: 'Attachments'
					}
				},
				{
					path: 'owner.user',
					model: 'Users'
				},
				{
					path: 'manager',
					model: 'Users'
				},
				{
					path: 'rented.data.by',
					model: 'Users'
				}]	
			})
			.populate({
				path: 'managed_properties',
				populate: [{
					path: 'development',
					model: 'Developments'
				},
				{
					path: 'pictures.kitchen',
					model: 'Attachments'
				},
				{
					path: 'pictures.toilet',
					model: 'Attachments'
				},
				{
					path: 'pictures.bed',
					model: 'Attachments'
				},
				{
					path: 'pictures.dining',
					model: 'Attachments'
				},
				{
					path: 'pictures.living',
					model: 'Attachments'
				},
				{
					path: 'amenities',
					model: 'Amenities',
					populate: {
						path: 'icon',
						model: 'Attachments'
					}
				}]	
			})
			.populate({
				path: 'shortlisted_properties',
				populate: [{
					path: 'development',
					model: 'Developments'
				},
				{
					path: 'pictures.kitchen',
					model: 'Attachments'
				},
				{
					path: 'pictures.toilet',
					model: 'Attachments'
				},
				{
					path: 'pictures.bed',
					model: 'Attachments'
				},
				{
					path: 'pictures.dining',
					model: 'Attachments'
				},
				{
					path: 'pictures.living',
					model: 'Attachments'
				},
				{
					path: 'amenities',
					model: 'Amenities',
					populate: {
						path: 'icon',
						model: 'Attachments'
					}
				}]	
			})
			.populate({
				path: 'rented_properties.property',
				populate: [{
						path: 'development',
						model: 'Developments'
					},
					{
						path: 'pictures.kitchen',
						model: 'Attachments'
					},
					{
						path: 'pictures.toilet',
						model: 'Attachments'
					},
					{
						path: 'pictures.bed',
						model: 'Attachments'
					},
					{
						path: 'pictures.dining',
						model: 'Attachments'
					},
					{
						path: 'pictures.living',
						model: 'Attachments'
					},
					{
						path: 'amenities',
						model: 'Amenities',
						populate: {
							path: 'icon',
							model: 'Attachments'
						}
					},
					{
						path: 'owner.user',
						model: 'Users'
					},
					{
						path: 'manager',
						model: 'Users'
					},
					{
						path: 'agreements.data',
						model: 'Agreements',
						populate: [{
							path: 'landlord',
							model: 'Users'
						},
						{
							path: 'tenant',
							model: 'Users'
						}]						
					}]			
			})
			.populate({
				path: 'rented_properties.agreement',
				model: 'Agreements'
			})
			.exec((err, users) => {
				err ? reject({message: err.message})
				: resolve(users);
			});
	});
});

usersSchema.static('getAll', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {};

		Users.getUser(_query).then(res => {
			resolve(res);
		})
		.catch((err)=> {
			reject({message: err.message});
		})
	});
});

usersSchema.static('me', (userId:string, headers:Object, device: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {"_id": userId};
		Users.getUser(_query).then(res => {
			let result = res[0] ? res[0] : {};
			if (result) {
				if (device == 'desktop') {
					resolve(result);
				}
				else {
					userHelper.meHelper(result, headers, '').then(res_data => {
						resolve(res_data);
					});
				}
			}
			else {
				reject({ message: 'User data not found.' });
			}
		})
		.catch((err) => {
			reject({message: err.message});
		})
	});
});

usersSchema.static('username', (data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = data;
		Users
			.findOne({"username": body.username})
			.exec((err, user) => {
				if (err) {
					reject({message: err.message});
				}
				else if (user) {
					resolve({message: "success"})
				}
				else {
					reject({message: "username not found"})
				}
			})
	});
});

usersSchema.static('meData', (userId:string, param:string, headers:Object, device: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users.me(userId, headers, device).then(res => {
			let type = ['tenant', 'landlord'];

			if (type.indexOf(param) > -1) {
				resolve(res[param]);
			}
			else if (param == 'property') {
				Properties.getUserProperties(userId, device).then(res => resolve(res));
			} 
			else {
				reject({ message: 'wrong type.' });
			}
		});
	});
});

usersSchema.static('getById', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {"_id": id};

		Users.getUser(_query).then(res => {
			_.each(res, (result) => {
				resolve(result);
			})	
		})
		.catch((err) => {
			reject({message: err.message});
		})
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
			err ? reject({message: err.message})
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
				reject({message: err.message});
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
			.findById(userId, '-blocked_users -dreamtalk -agreements -landlord -tenant -verification -role -__v')
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
					reject({message: err.message});
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
				reject({message: err.message});
			}
			else if(saved){
				Users.getTotalUserSignupToday();
				resolve({userId: saved._id});
			}
		});
	});
});

usersSchema.static('signUp', (user:Object, headers:Object, device: string):Promise<any> => {
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
			if (body.code) {
				_user.phone = body.code+''+body.phone;
			}
			else {
				_user.phone = body.phone;	
			}
			_user.role = 'user';
			_user.save((err, saved)=>{
				if(err){
					if (device == 'desktop') { reject(err); }
					else {
						let error = [];
						err.errors.username ? error.push('username') : '';
						err.errors.email ? error.push('email') : '';
						err.errors.phone ? error.push('phone') : '';
						err.errors.password ? error.push('password'): '';

						let message;
						if (error.length > 2) {
							let error_message = '';
							for (var i = 0; i < error.length - 1; i++){
								error_message = error_message + error[i] + ', ';
							}
							message = 'Incorrect ' + error_message + 'or ' + error[error.length-1];
						}
						else if (error.length == 2) {
							message = 'Incorrect ' + error[0] + ' or ' + error[1];
						}
						else {
							message = error[0] + ' null';
						}
						reject({
							message: message,
							code: 400
						});
					}
				}
				else if(saved){
				 	var token = signToken(_user._id, _user.role, _user.username);
					var fullname = _user.username;
					var from = 'Staysmart';
					SMS.sendActivationCode(body.phone, randomCode);
					mail.signUp(_user.email, fullname, from);
					Users.getTotalUserSignupToday();
					if (device == 'desktop') {
						resolve({userId: saved._id, token});				
					}
					else {
						userHelper.signUpHelper(saved._id, token, saved, headers).then(result => {
							resolve(result);
						});
					}
				}
			});
	});
});

usersSchema.static('getTotalUserSignupToday', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let today = new Date();
		let date = today.getDate();
		let nextDate = date + 1;
		let month = today.getMonth();
		let year = today.getFullYear();
		Users
			.find({"created_at": {"$gte": new Date(year, month, date), "$lt": new Date(year, month, nextDate)}})
			.exec((err, users) => {
				if (err) {
					reject({message: err.message});
				}
				else if (users) {
					let data = { total: users.length }
					socketIo.counterUser(data);
					resolve(users);
				}
			})
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
					"verification.expires" : new Date(+ new Date() + 5 * 60 * 1000),
					"verification.code": randomCode
				}
			})
			.exec((err, update) => {
				if (err) {
					reject({message: err.message});
				}
				else if (update) {
					Users
						.findById(id, (err, user) => {
							if(err){
								reject({message: err.message});
							}
							if(user){
								SMS.sendActivationCode(user.phone, randomCode)
								resolve({message: "Success resend verification code"});
							}
						})
				}
			});
	});
});

usersSchema.static('resendCode', (data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = data;
		let randomCode = Math.random().toString(36).substr(2, 6);
		Users
			.findOne({"email":body.email})
			.exec((err, user) => {
				if (err) { reject({message: err.message}); }
				else if (user) {
					if (user.verification.verified == true) {
						reject({message: "user is verified"});
					}
					else {
						user.verification.expires = new Date(+ new Date() + 5 * 60 * 1000);
						user.verification.code = randomCode;
						user.save((err, saved) => {
							if (err) {reject({message: err.message});}
							else {
								SMS.sendActivationCode(user.phone, randomCode);
								resolve({message: "Success resend verification code"});
							}
						})
					}					
				}
				else {
					reject({message: "user not found"});
				}
			})		
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
<<<<<<< HEAD
					.findByIdAndRemove(id)
					.exec((err, deleted) => {
						err ? reject({message: err.message})
							: resolve({message: 'user deleted'});
					});
=======
					.findById(id)
					.exec((err, user) => {
						if (err) {reject(err);}
						else if (user) {
							if (user.owned_properties.length > 0 || user.rented_properties.length > 0 || user.managed_properties.length > 0 || user.chat_rooms.length > 0) {
								reject({message: "can't to delete this user"})
							}
							else {
								Users
									.findByIdAndRemove(id)
									.exec((err, deleted) => {
										err ? reject(err)
											: resolve({message: 'user deleted'});
									});
							}
						}
						else {
							reject({message: "user not found"});
						}
					})				
>>>>>>> upstream/development
			}
		});
	});
});

usersSchema.static('changePassword', (id:string, oldpass:string, newpass:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Users
			.findById(id)
			.select('+password')
			.exec((err, user) => {
				if(err){
					reject({message: err.message});
				}
				if(user){
					user.authenticate(oldpass, (err, ok) => {
				        if(err) {
				          reject({message: err.message});
				        }
				        if(ok) {
				          	user.password = newpass;
				        	user.save((err, res) => {
				        		err ? reject({message: err.message})
									: resolve({message: 'data updated'});
				        	});
				        } else {
				        	reject({message: "old password didn't match"});				        	
				        }
				    });
				}
			})
	});
});

usersSchema.static('changeUserPassword', (id:string, oldpass:string, newpass:string, confpass:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users
			.findById(id)
			.select('+password -phone')
			.exec((err, user) => {
				if(err){
					reject({message: err.message});
				}
				if(user){
					user.authenticate(oldpass, (err, ok) => {
				        if(err) {
				          reject({message: err.message});
				        }
				        if(ok) {
				        	if (newpass == confpass) {
				        		user.password = newpass;
					        	user.save((err, res) => {
					        		err ? reject({message: err.message})
										: resolve({message: 'Success please re-login'});
					        	});
				        	}
				        	else {
				        		reject({message: "Password confirmation failed."});
				        	}
				        } else {
				        	reject({message: "old password didn't match"});				        	
				        }
				    });
				}
			})
	});
});

usersSchema.static('updateMe', (id:string, userData:Object, image:Object, headers: Object, device: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(userData)) {
			return reject(new TypeError('User is not a valid object.'));
		}
		let body:any = userData;
		let img: any = image;
		Users
			.findById(id)
			.select('-phone')
			.exec((err, user)=>{
				if(err){
					reject({message: err.message});
				}
				if(user){
					if(body.username) {
						user.username = body.username;
					}
					if(body.email) {
						user.email = body.email;
					}
					if(body.phone) {
						user.phone = body.phone;
					}
					if(img.photo) {
						Attachments.createAttachments(img.photo, {}, device).then(res => {
							user.picture = res.imgId;
							user.save((err, saved) => {
								if(err){
									reject({message: err.message});
								}
								if(saved){
									if(body.oldpassword && body.newpassword) {
										Users.changePassword(id, body.oldpassword, body.newpassword).then((res) => {
											resolve(res);
										})
										.catch((err) => {
											reject({message: err.message});
										})
									}
									else{
										Users.me(saved._id, headers, device).then(res => {
											resolve(res);
										})
									}
								}
							});
						})
					}
					else {
						user.save((err, saved) => {
							if(err){
								reject({message: err.message});
							}
							if(saved){
								if(body.oldpassword && body.newpassword) {
									Users.changePassword(id, body.oldpassword, body.newpassword).then((res) => {
										resolve(res);
									})
									.catch((err) => {
										reject({message: err.message});
									})
								}
								else{
									Users.me(saved._id, headers, device).then(res => {
										resolve(res);
									})
								}
							}
						});
					}
				}						
			});
	});
});

usersSchema.static('setDeviceToken', (id: string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body: any = data;
		Users.findByIdAndUpdate(id, {
			$push: {
				"service.device": {
					device_token: body.device_token,
					device_type: body.device_type
				}
			}
		}).exec((err, user) => {
			err ? reject({message: err.message})
				: resolve(1);
		});
	});
});

usersSchema.static('updateUser', (id:string, user:Object, currentUser:string, headers: Object):Promise<any> => {
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
						if(err){
							reject({message: err.message});
						}
						if(user){
							if(body.username) {
								user.username = body.username;
							}
							if(body.email) {
								user.email = body.email;
							}
							if(body.role) {
								user.role = body.role;
							}
							if(body.phone) {
								user.phone = body.phone;
							}
							if(body.picture) {
								user.picture = body.picture;
							}
							user.save((err, saved) => {
								if(err){
									reject({message: err.message, code: 400});
								}
								if(saved){
									if(body.oldpassword && body.newpassword) {
										Users.changePassword(id, body.oldpassword, body.newpassword).then((res) => {
											resolve(res);
										})
										.catch((err) => {
											reject({message: err.message});
										})
									}
									else{
										Users.me(saved._id, headers, 'phone').then(result => {
											resolve({
												message: 'success', 
												code: 200,
												data: result
											});
										});
									}
								}
				    	    });
						}						
					})
			}
		});
	});
});

usersSchema.static('updateUserData', (id:Object, type:string, userData:Object, currentUser:string):Promise<any> =>{
	return new Promise((resolve:Function, reject:Function) => {
		Users.validateUser(id, currentUser).then(res => {
			let body:any = userData;
			if(res.message) {
				reject({message: res.message});
			}
			else if(res == true){
				var ObjectID = mongoose.Types.ObjectId;  
				let userObj = {$set: {}};
					userObj.$set[type+'.data.name'] = body.name;
					userObj.$set[type+'.data.identification_type'] = body.identification_type;
					userObj.$set[type+'.data.identification_number'] = body.identification_number;
					userObj.$set[type+'.data.identification_proof'] = {'front': body.identification_proof.front, 'back': body.identification_proof.back};
				Users.createHistory(id, type).then(res => {
					Users
						.findByIdAndUpdate(id, userObj)
						.exec((err, update) => {
							err ? reject({message: err.message})
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
					err ? reject({message: err.message})
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
				if(type == 'tenant') {
					var history_data = datas.tenant.data;
				}
				else if(type == 'landlord'){
					var history_data = datas.landlord.data;
				}
				let historyData:any = history_data;
				if(historyData.name != null) {
					var historyObj = {$push: {}};
					historyObj.$push[type+'.histories'] = {"date": new Date(), "data": history_data};
					Users
						.findByIdAndUpdate(id, historyObj)
						.exec((err, saved) => {
							if(err) {
								reject({message: err.message});
							}
							else{
								var unsetObj = {$unset: {}};
								unsetObj.$unset[userOldData+'.name'] = "";
								unsetObj.$unset[userOldData+'.identification_type'] = "";
								unsetObj.$unset[userOldData+'.identification_number'] = "";
								unsetObj.$unset[userOldData+'.identification_proof'] = "";
								Users
									.findByIdAndUpdate(id, unsetObj)
									.exec((err, update) => {
										if(err) {
											reject({message: err.message});
										}
										else{
											resolve({message: 'history created.'});
										}
									});
							}
						});
				}
				else{
					resolve({message: 'still no data'});
				}
			})
	});
});

usersSchema.static('activationUser', (id:string, data:Object, headers:Object, device:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let body:any = data;
		Users
			.findById(id)
			.exec((err, user) => {
				if (err) { reject({message: err.message}); }
				else if (user) {
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
									if (err) {
										reject(err);
									}
									else {
										if (device == 'desktop') {
											resolve({message: 'user verified.'});
										}
										else {
											userHelper.activationHelper(id, headers).then(result => {
												resolve(result);
											});
										}
									} 
								});
						}
						else{
							reject({message: 'Your code has expired.'});
						}
					}
					else {
						reject({message: 'Your code is wrong or has expired.'});
					}	
				}
				else {
					reject({message: 'User not found'});
				}
			})		
		});
});

usersSchema.static('verifiedUser', (id:string, user:Object, headers:Object, device: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = user;

		Users
			.findById(id, (err,user)=>{
				var code = user.verification.code;
					
				if (code == body.verification_code){
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
								if (err) {
									reject({message: err.message});
								}
								else {
									if (device == 'desktop') {
										resolve({message: 'user verified.'});
									}
									else {
										userHelper.activationHelper(id, headers).then(result => {
											resolve(result);
										});
									}
								} 
							});
					}
					else{
						reject({message: 'Your code has expired.'});
					}	
				}
				else{
					reject({message: 'Your code is wrong or has expired.'});
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
				err ? reject({message: err.message})
					: resolve();
			});
	});
});

usersSchema.static('updateChatsRoom', (id:string, block:boolean):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		ChatRooms
			.findByIdAndUpdate(id, {
				$set: {
					"blocked": block
				}
			})
			.exec((err, updated) => {
				err ? reject({message: err.message})
					: resolve(updated);
			});
	});
});

usersSchema.static('blockUserMobile', (id:string, userId:Object, headers: Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users.findById(userId).exec((err, user) => {
			if (err) { reject({message: err.message}); }
			else {
				let rooms = user.chat_rooms;
				for (var i = 0; i < rooms.length; i++) {
					Users.blockUser(id, userId, rooms[i]);
				}
				Users.getById(userId).then(result => {
					userHelper.meHelper(result, headers, '').then(user_data => {
						resolve(user_data);
					})
				})
			}
		})
	});
});

usersSchema.static('blockUser', (id:string, userId:Object, roomId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let idUser = userId.toString();
		if(id == idUser){
			reject({message: "Cannot Block by yourself"})
		} 
		if(id != idUser){
			Users
			.find({"_id": userId, "blocked_users": {$in: [id]}})
			.exec((err, res) => {
				if(err){
					reject({message: err.message});
				}
				if(res){
					if(res.length == 0){
						Users
							.findByIdAndUpdate(userId, {
								$push: {
									"blocked_users": id 
								}
							})
							.exec((err, update) => {
								if(err){
									reject({message: err.message});
								}
								if(update){
									Users.updateChatsRoom(roomId, true);
									resolve(update);
								}
							});
					}
					if(res.length >= 1){
						resolve({message: "This User Already Block"})
					}
				}
			})
		}				
	});
});

usersSchema.static('unblockUser', (id:string, userId:Object, roomId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Users
			.find({"_id": userId, "blocked_users": {$in: [id]}})
			.exec((err, res) => {
				if(err){
					reject({message: err.message});
				}
				if(res){
					if(res.length == 0){
						resolve({message: "Not found user in blocked list"})
					}
					if(res.length >= 1){
						Users
							.findByIdAndUpdate(userId, {
								$pull: {
									"blocked_users": id
								}
							})
							.exec((err, update) => {
								if(err){
									reject({message: err.message});
								}
								if(update){
									Users.updateChatsRoom(roomId, false);
									resolve(update);
								}
							});
					}
				}
			})		
	});
});

usersSchema.static('forgetPassword', (email:string, headers):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users.sendResetPassword(email).then(res => {
			Users.findOne({"email": email}).exec((err, user) => {
				if (err) { reject({message: err.message}); }
				else {
					let id = user._id;
					Users.getById(id).then(result => {
						userHelper.meHelper(result, headers, 'success').then(user_data => {
							resolve(user_data);
						})
					});
				}
			});
		})
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
			Users.checkUserData(email).then(res => {
				console.log(res);
				if(res.message == true) {
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
								reject({message: err.message});
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
					reject({message: 'no user found with that email.'});
				}
			})
					
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
			        			err ? reject({message: err.message})
			        				: resolve(saved);
			        		})
			        		Users
			        			.update({"reset_password.token": token}, {
			        				$unset: {"reset_password": ""}
			        			})
			        			.exec((err, update) => {
									err ? reject({message: err.message})
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

usersSchema.static('validateUser', (userId:string, currentUser:string):Promise<any> => {
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
			else{
				resolve(true);
			}
		})
	});
});

usersSchema.static('resetPasswordMobile', (data:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
		let body: any = data;
		Users.findOne({"email": body.email, "reset_password.token": body.code}).exec((err, res) => {
			if (err) { reject({message: err.message}); }
			else {
				if(res == null) {
					reject({message: 'You already reset your password.'});
				}
				else{
					var dateNow = new Date();
					if(dateNow < res.reset_password.expired_at) {
						if (body.password == body.password_confirmation) {
							res.password = body.password;
							res.save((err, saved)=>{
								if (err) { reject({message: err.message}) };
							})
							Users
								.update({"reset_password.token": body.code}, {
									$unset: {"reset_password": ""}
								})
								.exec((err, update) => {
									err ? reject({message: err.message})
										: resolve({message: 'Success please re-login.'});
								});
						}
						else {
							reject({message: "Your password didn't match."});
						}	
					}
					else{
						reject({message: "Your link has expired."});
					}
				}
			}
		})
    });
});

usersSchema.static('decodeToken', (token:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var decoded = jwtDecode(token);
        resolve(decoded);
    });
});

usersSchema.static('refreshToken', (authorization:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let token = authorization.substring(7);
        Users.decodeToken(token).then((res) => {
          let userId = res._id;
          if (res.exp) {
            Users
            .findById(userId)
            .exec((err, user) => {
              if (err) {
				  reject({message: err.message});
              }
              else if (user) {
				  Users.logout(user._id.toString(), authorization);
				  var newToken = signToken(user._id, user.role, user.username);
				  resolve({token: newToken});
              }
            })
          }
          else {
            reject({message:"token not expired"})
          }          
        })
        .catch((err)=> {
          reject({message: err.message});
        })        
    });
});

usersSchema.static('logout', (userId:string, authorization:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let token = authorization;
		let data = {
			token: token,
			date: new Date()
		};
		Users
		.findByIdAndUpdate(userId, {
			$push: { 
				blacklisted_token: data
			}
		})
		.exec((err, updated) => {
			err ? reject({message: err.message})
				: resolve(updated);
		})
	});
});

usersSchema.static('privacy', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		resolve(
			[
				{
					"content": [
						"Thank you for visiting Staysmart’s website at <a href=\"https://www.staysmart.sg\">www.staysmart.sg</a> (the “Site”). For the purpose of this Privacy Policy, “Staysmart”, “we”, “our” or “us” shall refer to Staysmart Pte. Ltd. \n\nStaysmart aims to help home owners, potential tenants and potential buyers connect with one another without having to go through a middleman and pay any brokerage or commission fee (the “Service”). The Service is provided through the Site <a href=\"https://www.staysmart.sg\">www.staysmart.sg</a>.\n\nThe Service provided through the Site is specifically targeted at home owners, potential tenants and potential buyers only, and is not intended for real estate agents or salespersons. For avoidance of doubt, real estate agents, salespersons or any other person are not allowed to use the Site, or the Service for commercial or business purposes.\n\nBy accessing and using any part of the Site, you shall be deemed to have accepted and be legally bound by the terms of this Privacy Policy without limitation or qualification. If you do not agree to the terms of this Privacy Policy, please do not access or use the Site. Any continued access or use of the Site (whether this time or in future) will imply that you have accepted the terms of this Privacy Policy.\n\nWe take your privacy very seriously. We ask that you read this privacy policy (the “Policy”) carefully as it contains important information about what to expect when Staysmart collects personal information about you and how Staysmart will use your personal data."
					]
				},
				{
					"title": "COLLECTION, USE AND DISCLOSURE OF PERSONAL INFORMATION",
					"content": [
						"If you are only browsing the Site or using the search function, we do not capture data that allows us to identify you individually. The Site automatically receives and records information on our server logs from your browser, including your IP address, cookie information, and the page(s) requested.",
						"By providing your personal information to us through the Site, you consent to our collection, use and disclosure of your personal information in accordance with this Privacy Policy.",
						"We may collect, use and/or disclose your personal information for the following purposes:\n1. setting up your registered user account and profile on the Site;\n2. to provide and improve the Service;\n3. to verify that you are an actual home owner, potential tenant or potential buyer, and not a real estate agent or salesperson;\n4. to send to you emails which are specific to your account and which are necessary for the normal functioning of the Service, including one or more welcome emails which help inform new users about various features of the Service;\n5. for targeted online marketing;\n6. to contact you regarding any complaints, feedback, queries or requests;\n7. handling any issues which have come to our attention;\n8. to facilitate investigations into any suspicious or illegal activity on the Site;\n9. for internal administrative and management purposes;\n10. where required by any act, statute, law, or regulation, or by the order of a government authority or a court or tribunal of competent jurisdiction;\n11. such other purposes consented by you for which your personal information is collected;\n12. any other purpose reasonably related to the aforesaid.\nWe may disclose your personal information to our partners, agents, or affiliates whom we have engaged to provide the Service, to maintain the Site or to protect the security or integrity of the Site and our databases. We will use commercially reasonable efforts to ensure that such partners, agents or affiliates do not use your personal information for a purpose other than the purposes for which the personal information were originally given."
					]
				},
				{
					"title": "CONFIDENTIALITY",
					"content": [
						"Save where expressly provided herein, we will not reveal to any person, firm or company any personal information which may come to our knowledge hereunder and shall keep with complete secrecy the personal information provided by you and shall not use or attempt to use any such personal information in any manner without your permission. These restrictions shall cease to apply to information or knowledge which may come into the public domain other than as a result of any act or breach of this Privacy Policy by us."
					]
				},
				{
					"title": "CHANGING OR DELETING YOUR INFORMATION",
					"content": [
						"You may review and change your personal information in your account settings, except for your National Registration Identity Card (NRIC) number and full name. We will not be responsible for any modification of your personal information specified in your account."
					]
				},
				{
					"title": "ACCESS TO YOUR INFORMATION AND UPDATING AND CORRECTING YOUR INFORMATION",
					"content": [
						"Subject to the exceptions referred to in section 21(2) of the Personal Data Protection Act 2012 (No. 26 of 2012) of Singapore (“PDPA”), you have the right to request a copy of the information that we hold about you. If you would like a copy of some or all of your personal information, please send an email to support@staysmart.com. We may make a small charge for this service.",
						"We want to ensure that your personal information is accurate and up to date. If any of the information that you have provided to Staysmart changes, for example if you change your email address, name or payment details, or if you wish to cancel your registration, please let us know the correct details by sending an email to support@staysmart.com or by sending a letter to 21 Telok Blangah Drive, #29-03 Harbour View Towers, Singapore 109258. You may ask us, or we may ask you, to correct information you or we think is inaccurate, and you may also ask us to remove information which is inaccurate."
					]
				},
				{
					"title": "SECURITY OF YOUR PERSONAL INFORMATION",
					"content": [
						"The security of your personal information is important to us. Your account information is protected by a password. It is important that you protect against unauthorized access of your account and information by choosing your password carefully, and keeping your password and computer secure by signing out after using the Service.",
						"Where appropriate, we use available technology to protect the security of communications made through the Site. However, as no data transmission over the Internet can be guaranteed to be completely secure, we cannot guarantee the security of any information you transmit to us, and you transmit such information at your own risk. We do not accept liability for the security, authenticity, integrity or confidentiality of any transaction and other communications made through the Site.",
						"Internet communications may be susceptible to interference or interception by third parties. Despite our best efforts, we make no warranties that the Site is free of viruses or other unauthorised software.",
						"You should take appropriate steps to keep your information, software and equipment secure. This includes clearing your Internet browser cookies and cache before and after using the Service on the Site."
					]
				},
				{
					"title": "THIRD PARTY WEBSITES",
					"content": [
						"The Site may contain hyperlinks to and from other Internet websites. These websites may have different privacy practices from the ones described here. Since this Privacy Policy applies solely to the Site, please read the privacy statements of the other websites you visit."
					]
				},
				{
					"title": "APPLICABLE LAW",
					"content": [
						"The terms in this Privacy Policy are governed by the laws of the Republic of Singapore."
					]
				},
				{
					"title": "MODIFICATION",
					"content": [
						"The terms of this Privacy Policy may be changed from time to time. All changes will be posted on this page, and your access or use of the Site after such changes have been posted will constitute your agreement to the modified Privacy Policy and all of the changes. You should therefore read this page carefully each time you visit the Site."
					]
				}
			]
		);
	});
});

usersSchema.static('terms', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		resolve(
			[
				{
					"title": "ACCEPTANCE OF TERMS",
					"content": [
						"Your use of this Site is subject to these Terms and Conditions.\nBy using this Site, you are deemed to have accepted and agree to be bound by these Terms and Conditions.\nWe may make changes to these Terms and Conditions from time to time. Your uses of the Site following changes to these Terms of Conditions will constitute your acceptance of those changes."
					]
				},
				{
					"title": "ABILITY TO ACCEPT TERMS AND CONDITIONS",
					"content": [
						"You affirm that you are either more than 18 years of age, or possess legal parental or guardian consent, and are fully able and competent to enter into the terms, conditions, obligations, affirmations, representations, and warranties set forth in these Terms and Conditions, and to abide by and comply with these Terms and Conditions."
					]
				},
				{
					"title": "TRADEMARKS",
					"content": [
						"Staysmart, its related companies, affiliates, contractors and/or participating corporations are the owners of the trade and service marks appearing on this Site and all rights are reserved in respect of such trade and service marks."
					]
				},
				{
					"title": "REGISTRATION",
					"content": [
						"Please note that the Site and the Service are only meant for home owners, potential tenants and potential buyers for their own needs. Real estate agents, salespersons or any other person who intend to use the Site, or the Service for commercial or business purposes shall not be allowed to register for an account on the Site.",
						"Please note that each user shall only be entitled to one account to be used when accessing the Site. Your account is personal to you, and you may not assign or transfer your account or any of your rights under these Terms and Conditions to any third party without our prior written consent. Any attempted assignment or transfer in violation of the foregoing shall be deemed a material breach of these Terms and Conditions.",
						"In order to register for an account on the Site, we will require you to provide us with certain personal information, including but not limited to your name, email address, National Registration Identity Card (NRIC) number, home address, contact number and a password of your choice. You confirm that all information provided is true, accurate, correct and up to date.",
						"You are responsible for the confidentiality of the username and password allocated to you and you shall take ownership of all activity and transactions under your account. You shall notify us immediately if you become aware of any unauthorized use of your password or account or any other breach of security."
					]
				},
				{
					"title": "RESTRICTION, DELETION OR SUSPENSION OF ACCOUNT OR SERVICES",
					"content": [
						"We reserve the right to restrict, suspend or delete your account or restrict your access to the Site, or to restrict, suspend or cease to provide the Service to you at any time at our sole discretion for any reason whatsoever. If your account is suspended, restricted, or deleted, you are not permitted to continue to use the Service or the Site under a different or new account without our prior approval.",
						"You may terminate your account at any time by writing to us at support@staysmart.sg. We may terminate your account for inactivity for at least a period of 365 days at our sole discretion."
					]
				},
				{
					"title": "USE OF SITE",
					"content": [
						"You agree that you will not:\n1. use the Site for purposes of conducting and/or disseminating surveys, contests, pyramid schemes, chain letters, junk email, spamming or sending of any duplicative or unsolicited messages;\n2. defame, abuse, harass, stalk, threaten or otherwise violate the legal rights (such as rights of privacy) of others;\n3. publish, post, upload, distribute or disseminate any inappropriate, profane, defamatory, obscene, indecent or unlawful material or information;\n4. upload, or otherwise make available, files that contain images, photographs, software or other material protected by intellectual property laws, including, by way of example, and not as limitation, copyright or trademark laws (or by rights of privacy or publicity) unless you have ownership or control the rights thereto or have received all necessary consent to do the same;\n5. use any material or information, including images or photographs, which are made available through the Site in any manner that infringes any copyright, trademark, patent, trade secret, or other proprietary right of any party;\n6. upload files that contain viruses, corrupted files, or any other similar software or programs that may damage the operation of another's computer or property of another;\n7. violate any applicable laws or regulations;\n8. create a false identity for the purpose of misleading others.",
						"You will be required to provide information regarding your property if you are a home owner looking to rent or sell your property and information about your requirements, if you are a potential tenant or potential buyer. We reserve the right to request additional information from you to ensure and verify that you are not a real estate agent or salesperson."
					]
				},
				{
					"title": "LINKS TO OTHER SITES",
					"content": [
						"The Site may contain information from third party sites or web applications such as Google Maps (“Third Party Content”). Staysmart makes no representation and is not responsible for such Third Party Content and shall not be liable for any damages or loss arising from access or use of such Third Party Content. Any content, services, representations made on such websites and/or web applications are solely the responsibility of the operator of those websites and/or web applications and Staysmart assumes no responsibility for any content, the operation or the services provided thereon. Use of the hyper-links and access to such linked websites and/or web applications are entirely at your own risk."
					]
				},
				{
					"title": "INDEMNITY",
					"content": [
						"You shall indemnify and hold us, our officers, directors, shareholders, predecessors, successors in interest, employees, agents, subsidiaries and affiliates, harmless from all demands, claims, actions, proceedings, judgements, orders, decrees, damages, costs, losses and expenses of any nature whatsoever against us by any third party due to or arising out of or in connection with any failure by you to comply with any of these Terms and Conditions or otherwise by your use of the Site, or the Service."
					]
				},
				{
					"title": "CONSENT FOR USE OF PERSONAL INFORMATION",
					"content": [
						"You hereby consent to our collection, use and disclosure of your personal information provided to us.",
						"You agree that we may collect, use or disclose your personal information for the following purposes:\n1. setting up your registered user account and profile on the Site;\n2. to provide and improve the Service;\n3. to verify that you are an actual home owner, potential tenant or potential buyer, and not a real estate agent or salesperson;\n4. to send to you emails which are specific to your account and which are necessary for the normal functioning of the Service, including one or more welcome emails which help inform new users about various features of the Service;\n5. for targeted online marketing;\n6. to contact you regarding any complaints, feedback, queries or requests;\n7. handling any issues which have come to our attention;\n8. to facilitate investigations into any suspicious or illegal activity on the Site;\n9. for internal administrative and management purposes;\n10. where required by any act, statute, law, or regulation, or by the order of a government authority or a court or tribunal of competent jurisdiction;\n11. such other purposes consented by you for which your personal information is collected;\n12. handling any issues which have come to our attention;\n13. any other purpose reasonably related to the aforesaid.",
						"We may disclose your personal information to our partners, agents, or affiliates whom we have engaged to provide the Service, to maintain the Site or to protect the security or integrity of the Site and our databases. We will use commercially reasonable efforts to ensure that such partners, agents or affiliates do not use your personal information for a purpose other than the purposes for which the personal information were originally given."
					]
				},
				{
					"title": "SHARING OF YOUR INFORMATION",
					"content": [
						"We will not rent or sell your information to third parties outside of Staysmart without your consent, except in accordance with these Terms and Conditions.",
						"We may remove parts of data that can identify you, and share anonymised data with other parties. We may also combine your information with other information in a way that is no longer associated with you and share that aggregated information.",
						"Any information or content that you voluntarily disclose for posting to the Service becomes available to the public. You may opt out of the public sharing of your information by editing your privacy settings. Once you have shared your information or made it public, such content may be re-shared by others.",
						"Subject to your profile and privacy settings, any information that you make public is searchable by other members of the Service.",
						"Information that you post to the Service can be removed by you, however, copies may remain viewable in cached and archived pages of the Service, or if other users or third parties have copied or saved that information."
					]
				},
				{
					"title": "LANGUAGE",
					"content": [
						"If the information on this Site is translated into or presented in languages other than English, the English version of that information will prevail in relation to any disputes regarding its interpretation."
					]
				},
				{
					"title": "NO WARRANTY",
					"content": [
						"The Service, the Site and the content therein are provided on an “as is”, “as available” basis. We do not warrant the correctness, accuracy, adequacy, completeness, timeliness or validity of the Service, the Site and/or the content therein and expressly disclaims liability for errors or omissions in the content. No warranty of any kind, implied, express or statutory, including but not limited to the warranties of non-infringement of third party rights, title, merchantability, satisfactory quality and/or fitness for a particular purpose, is given in conjunction with the Service, the Site and the content therein.",
						"We do not warrant that the Service, the Site and/or any content therein will be provided uninterrupted or free from errors or that any identified faults will be corrected. No warranty is given that the Service, the Site and the content therein are free from any computer virus or other malicious, destructive or corrupting code/programme."
					]
				},
				{
					"title": "ACKNOWLEDGEMENT",
					"content": [
						"You acknowledge and agree that you are solely responsible for (and that we have no responsibility to you or to any third party for) any data that you transmit, update or upload while using the Site and for the consequences of your actions (including any loss or damage which we may suffer) by doing so;",
						"Your use and reliance on the content on the Site is entirely at your own risk, and therefore we specifically disclaim any liability arising from or in connection with your use of the Site, including but not limited to any damages or losses which you may suffer as a result of the buying, selling or renting of any property through the Site;",
						"We shall not be responsible for any materials posted on the Site, including, but not limited to, information relating to any property;",
						"We shall not be responsible for any disputes, demands, claims, actions, proceedings, judgments, orders, decrees, damages, costs, losses and expenses of any nature whatsoever arising out of or in connection with the buying, selling or rental of any property conducted through the Site;",
						"You are required to use your own judgment, caution, and common sense in evaluating the information provided on the Site and any information provided by us or any third party;",
						"We reserve the right to review materials posted, to edit, refuse to post, to remove any content, terminate your access to the Site at our sole discretion at any time, without notice, for any reason whatsoever;",
						"The Site may become temporarily unavailable for a number of reasons, including but not limited to, capacity constraints, transmission limitations, equipment modifications, upgrades, relocations, and repairs. Notwithstanding this, we will use reasonable commercial efforts to minimize such non-availability of the Site."
					]
				},
				{
					"title": "LIMITATION OF LIABILITY",
					"content": [
						"We shall in no event be liable for any death, injury, direct, indirect, incidental, special, consequential, exemplary damages or other indirect damages or costs of any kind suffered or incurred by you or any third party arising from or in connection with:\n1. any acts or omissions of any home owner, potential tenant or potential buyer;\n2. any content or material on the Site, including but not limited to any incorrectness, inaccuracy, inadequacy, incompleteness or invalidity thereof;\n3. any unauthorized access by any person of your account with us;\n4. any access, use or the inability to access or use the Site, or reliance on the materials and/or any information on the Site;\n5. any system, server or connection failure, error, omission, interruption, delay in transmission, or computer virus;\n6. any use of or access to any other website linked to the Site, even if we or our agents or employees are advised of the possibility of such damages, losses and/or expenses. Any hyperlinks to any other websites are not an endorsement of such websites and such websites should only be accessed at your own risks.",
						"This provision shall take effect to the fullest extent permitted by the applicable law."
					]
				},
				{
					"title": "PROPRIETARY RIGHTS",
					"content": [
						"You acknowledge and agree that we own, or have the licence to use the Site, including the source codes, pages, documents and online graphics, audio, video and such other contents found on the Site and any and all intellectual property rights used or embodied in or in connection thereto, including any suggestions, ideas, enhancement requests, feedback, recommendations or other information that you may provide relating to the Site or the Service. The Site and the content therein shall not be reproduced, republished, transmitted or distributed in any way, without our prior written permission.",
						"You further acknowledge that we own, or have the exclusive licence to use, the Trade Marks, and may from time to time apply for registration of other Trade Marks and service marks. We are not aware of other persons using any of the Trade Marks and we do not warrant that we have sole or exclusive rights in and to such Trade Marks. You agree not to at any time contest our ownership of the Trade Marks and undertake not to use the Trade Marks without our prior written consent and/or in derogation of our rights.",
						"For the purposes of these Terms and Conditions, “Trade Marks” means the “Staysmart” mark and such other marks and devices used by and belonging to us whether registered or not and all such other trade marks, trade names, service marks, trade dress, logos, and emblems which are under our control or ownership and which we stipulate are to be used from time to time by us."
					]
				},
				{
					"title": "GENERAL",
					"content": [
						"Nothing contained in these Terms and Conditions shall be so construed as to create any agency, partnership or joint venture of any kind between the parties hereto.",
						"No failure by us to exercise and no delay by us in exercising any right, power or remedy under these Terms and Conditions will operate as a waiver. Nor will any single or partial exercise by us of any right, power or remedy preclude any other or further exercise of that or any other right, power or remedy by us. No waiver shall be valid unless in writing signed by us. The rights and remedies herein are in addition to any rights or remedies provided by law.",
						"All rights and obligations hereunder are personal to the parties and each party shall not assign any such rights and obligations to any third party without our prior written consent.",
						"Any one or more clauses, stipulations or provisions of these Terms and Conditions, or any part thereof, which is declared or adjudged to be illegal, invalid, prohibited or unenforceable under any applicable law in any jurisdiction shall be ineffective to the extent of such illegality, invalidity, prohibition or unenforceability without invalidating, vitiating or rendering unenforceable the remaining clauses, stipulations or provisions of these Terms and Conditions, and any such illegality, invalidity, prohibition or unenforceability in any jurisdiction shall not invalidate, vitiate or render unenforceable any such clauses, stipulations or provisions in any other jurisdiction."
					]
				},
				{
					"title": "GOVERNING LAW",
					"content": [
						"These Terms of Use will be governed by and construed in accordance with the laws of Singapore, and the courts of Singapore will have non-exclusive jurisdiction over any claim or dispute arising under or in connection with these Terms and Conditions."
					]
				}
			]
		);
	});
});

usersSchema.static('refunds', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		resolve(
			[
				{
					"content": "*To safeguard the interest of our users, collections of Good Faith Deposit (GFD) and Security Deposit (SD), if any, will be held with Staysmart, until final conclusion of the Letter of Intent (LOI) or Tenancy Agreement (TA) respectively.\n\nThe table below sets out the various scenarios where the Good Faith Deposit (GFD) will be refunded and forfeited.\n\nPlease note that upon the conclusion of a Tenancy Agreement (TA) between the landlord and tenant, Staysmart will disburse to the landlord the Good Faith Deposit (GFD) and Security Deposit (SD) less any fees payable by the landlord to Staysmart.\n\nSubsequent refund of the Security Deposit (SD), if any, will be between the landlord and the tenant based on the terms agreed in the Tenancy Agreement (TA), which Staysmart is not a party of."
				},
				{
					"table": {
						"column1": "",
						"column2": "Purpose",
						"column3": "Will be refunded back to the tenant if:",
						"column4": "Will be forfeited to the landlord if:"
					}
				},
				{
					"table": {
						"column1": "Good Faith Deposit (GFD)*",
						"column2": "Paid together with the Letter of Intent (LOI), and serves as a financial token to credibly back your intentions.\n\nWill be converted into part of the Security Deposit or advance rental upon successful conclusion of the Tenancy Agreement (TA)",
						"column3": "Landlord does not agree to the terms of the Letter of Intent (LOI); or\n\nUpon conclusion of the LOI, landlord decides not to proceed on with the deal",
						"column4": "Upon conclusion of the LOI, tenant decides not to proceed on with the deal"
					}
				},
				{
					"table": {
						"column1": "Security Deposit (SD)",
						"column2": "Paid upon conclusion of the Tenancy Agreement (TA).\n\nPrimarily it serves as a security for the landlord in the event the property is damaged due to negligence on part of the tenant.\n\nHowever, in the event of a premature termination of the lease by the tenant that is not in accordance with the terms of the TA, the landlord may also withhold the SD to cover the inconvenience suffered.",
						"column3": "Upon conclusion of the LOI, landlord decides not to proceed on with the deal"
					}
				},
				{
					"content": "*Together with Stamp Duty Fee paid to Staysmart for stamping of the Tenancy Agreement (TA)."
				}
			]
		);
	});
});

usersSchema.static('facebookLoginMobile', (data: Object, device: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body: any = data;
		if (body.accessToken) {
			FB.setAccessToken(body.accessToken);
			FB.api('me', { fields: ['id', 'email', 'picture', 'name', 'first_name', 'last_name', 'link', 'gender', 'age_range'] }, function (res) {
				if(!res || res.error) {
					reject({message: res.error});
				}
				else if (!res.email || res.email == null || res.email == undefined || res.email == '') {
					reject({
						message: {
							err: 'Email not found!',
							data: {
								id: res.id,
								name: res.name,
								first_name: res.first_name,
								last_name: res.last_name,
								link: res.link,
								gender: res.gender,
								locale: res.locale,
								age_range: res.age_range,
								accessToken: body.accessToken,
								email: ''
							}
						},
						code: 400
					});
				}
				else {
					Users.find({"service.facebook.id": res.id}).exec((err, result) => {
						if (err) { reject({message: err.message}); }
						else if (result.length == 0) {
							let email;
							var _new_user = new Users();
								_new_user.username = res.id;
								if (body.email) {
									email = body.email;
								}
								else {
									email = res.email;
								}
								_new_user.email = email;
								_new_user.service.facebook.id = res.id;
								_new_user.service.facebook.token = body.accessToken;
								_new_user.service.facebook.picture = "http://graph.facebook.com/"+res.id+"/picture/?type=large";
								_new_user.save((err, saved)=>{
									if (err) { 
										if (device == 'desktop') { reject(err); }
										else {
											if (err.errors.email) {
												Users.findOne({"email": email}).exec((err, user) => {
													if (err) { reject({message: err.message}); }
													else {
														user.service.facebook.id = res.id;
														user.service.facebook.token = body.accessToken;
														user.service.facebook.picture = "http://graph.facebook.com/"+res.id+"/picture/?type=large";
														user.save((err, userSaved) => {
															if (err) { reject({message: err.message}); }
															else {
																let token = signToken(userSaved._id, userSaved.role, userSaved.username);
																resolve({
																	"x-auth-token": token,
																	_id: userSaved._id,
																	email: userSaved._id,
																	roles: userSaved.role,
																	verified: userSaved.verification.verified,
																	picture: userSaved.service.facebook.picture
																});
															}
														})
													}
												})
											}
											
										}
									}
									else {
										let token = signToken(saved._id, saved.role, saved.username);
										resolve({
											"x-auth-token": token,
											_id: saved._id,
											email: saved._id,
											roles: saved.role,
											verified: saved.verification.verified,
											picture: saved.service.facebook.picture
										});
									}
								});
						}
						else {
							let token = signToken(result[0]._id, result[0].role, result[0].username);
							resolve({
								"x-auth-token": token,
								_id: result[0]._id,
								email: result[0]._id,
								roles: result[0].role,
								verified: result[0].verification.verified,
								picture: result[0].service.facebook.picture
							});
						}
					});
				}
			});
		}
		else {
			reject({message: 'Missing credential'});
		}
	});
});

let Users = mongoose.model('Users', usersSchema);

export default Users;