import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import usersSchema from '../model/users-model';
import Agreements from '../../agreements/dao/agreements-dao'
import Attachments from '../../attachments/dao/attachments-dao'
import Banks from '../../banks/dao/banks-dao'
import Companies from '../../companies/dao/companies-dao'
import Properties from '../../properties/dao/properties-dao'

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
			.populate("agreements attachments banks companies properties")
			.exec((err, users) => {
				err ? reject(err)
				: resolve(users);
			});
	});
});

usersSchema.static('getById', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {

		Users
			.findById(id, '-salt -password')
			.populate("agreements attachments banks companies properties")
			.exec((err, users) => {
				err ? reject(err)
				: resolve(users);
			});
	});
});

usersSchema.static('createUser', (user:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(user)) {
			return reject(new TypeError('User is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		let body:any = user;

		var _user = new Users(user);
			_user.save((err, saved)=>{
				err ? reject(err)
				: resolve(saved);
			});
	});
});

usersSchema.static('updateUserData', (id:string, type:string, userData:Object, front:Object, back:Object):Promise<any> =>{
	return new Promise((resolve:Function, reject:Function) => {
		if(!_.isString(id) && !_.isObject(userData)) {
			return reject(new TypeError('User data is not a valid object or id is not a valid string.'));
		}
		
		var ObjectID = mongoose.Types.ObjectId;  
		let userObj = {$set: {}};
		
		for(var param in userData) {
			userObj.$set[type+'.data.'+param] = userData[param];
		}

		Users
			.findById(id, (err, usersData) => {
				let dataRole = usersData+'.'+type;
				if( dataRole != null) {
					var date = Date.now;
					
				}
			})
			.exec((err, saved) => {
				err ? reject(err)
				: resolve(saved);
			});

		Users
			.findByIdAndUpdate(id, userObj)
			.exec((err, updated) => {
				err ? reject(err)
				: resolve(updated);
			});

		if(front) {
			Attachments.createAttachments(front).then(res => {
				var idFront = res.idAtt;
				let frontObj = {$set: {}};
				let front_proof = type+'.data.identification_proof.front';
				frontObj.$set[front_proof] = idFront;
				Users
					.findByIdAndUpdate(id, frontObj)
					.exec((err, saved) => {
						err ? reject(err)
						: resolve(saved);
					});
			});	
		}
		if(back) {
			Attachments.createAttachments(back).then(res => {
				var idBack = res.idAtt;
				let backObj = {$set: {}};
				let back_proof = type+'.data.identification_proof.back';
				backObj.$set[back_proof] = idBack;
				Users
					.findByIdAndUpdate(id, backObj)
					.exec((err, saved) => {
						err ? reject(err)
						: resolve(saved);
					});
			});
		}
	});
});

usersSchema.static('deleteUser', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		Users
			.findById(id, (err, userr) => {
				if(userr.tenant.data.bank_account.bank != null) {
					var ObjectID = mongoose.Types.ObjectId; 
					let bank_account = userr.tenant.data.bank_account.bank;

					Banks
						.findByIdAndRemove(bank_account)
						.exec((err, deleted) => {
							err ? reject(err)
							: resolve();
						});
				}
				if(userr.landlord.data.bank_account.bank != null) {
					var ObjectID = mongoose.Types.ObjectId; 
					let bank_account = userr.landlord.data.bank_account.bank;

					Banks
						.findByIdAndRemove(bank_account)
						.exec((err, deleted) => {
							err ? reject(err)
							: resolve();
						});
				}
			})
			.exec((err, deleted) => {
				err ? reject(err)
				: resolve();
			});

		Users
			.findByIdAndRemove(id)
			.exec((err, deleted) => {
				err ? reject(err)
				: resolve();
			});
	});
});

usersSchema.static('updateUser', (id:string, user:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(user)) {
			return reject(new TypeError('User is not a valid object.'));
		}

		Users
			.findByIdAndUpdate(id, user)
			.exec((err, updated) => {
				err ? reject(err)
				: resolve(updated);
			});
	});
});

usersSchema.static('activationUser', (id:string, code:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		Users
			.findByIdAndUpdate(id,{
				$set:
				{
					"verification.verified": true, 
					"verification.verified_date": Date.now(), 
					"verification.code": code
				}
			})
			.exec((err, updated) => {
				err ? reject(err)
				: resolve(updated);
			});
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

let Users = mongoose.model('Users', usersSchema);

export default Users;