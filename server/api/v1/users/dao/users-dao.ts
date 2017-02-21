import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import usersSchema from '../model/users-model';
// import Agreements from '../../agreements/dao/agreements-dao'
// import Attachments from '../../attachments/dao/attachments-dao'
// import Banks from '../../banks/dao/banks-dao'
// import Companies from '../../companies/dao/companies-dao'
// import Properties from '../../properties/dao/properties-dao'

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
			// .populate("agreements attachments banks companies properties")
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

usersSchema.static('deleteUser', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

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