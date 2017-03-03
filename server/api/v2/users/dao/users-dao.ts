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
			.populate("agreements attachments banks companies properties picture")
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
			.populate("picture tenant.data.identification_proof.front tenant.data.identification_proof.back tenant.data.bank_account.bank landlord.data.identification_proof.front landlord.data.identification_proof.back landlord.data.company landlord.data.bank_account.bank owned_properties companies")
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
			.findById(id, '-salt -password')
			.populate("picture tenant.data.identification_proof.front tenant.data.identification_proof.back tenant.data.bank_account.bank landlord.data.identification_proof.front landlord.data.identification_proof.back landlord.data.company landlord.data.bank_account.bank owned_properties companies")
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

		let randomCode = Math.random().toString(36).substr(2, 6);

		var _user = new Users(user);
		_user.verification.code = randomCode;
		_user.save((err, saved)=>{

			err ? reject(err)
				: resolve(saved);
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
					"verification.code": randomCode
				}
			})
			.exec((err, deleted) => {
				err ? reject(err)
				: resolve();
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

usersSchema.static('updateUser', (id:string, user:Object, attachment:Object ):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(user)) {
			return reject(new TypeError('User is not a valid object.'));
		}
		let body:any = user;
    let file:any = attachment;
    let attachmentFile = file.picture;

    if(attachmentFile){
      Attachments.createAttachments(attachmentFile)
      .then(res => {
      	var idAttachment = res.idAtt;
          Users
          	.update({"_id": id}, {
          		$set: {
          			"picture": idAttachment
          		}
          	})    
          	.exec((err, updated) => {
							err ? reject(err)
								: resolve(updated);
						});
      })
      .catch(err=>{
          resolve({message: "attachment error"});
      }) 
    }  

		Users
			.findById(id, (err, user)=>{
				user.username = body.username;
	      user.email = body.email;
	      user.phone = body.phone;
	      if(body.password){
	      	user.password = body.password;
	      }	            
	      user.save((err, saved) => {
	        err ? reject(err)
	            : resolve(saved);
	        });
			})
	});
});

usersSchema.static('updateUserData', (id:string, type:string, userData:Object, files:Object):Promise<any> =>{
	return new Promise((resolve:Function, reject:Function) => {
		if(!_.isString(id) && !_.isObject(userData)) {
			return reject(new TypeError('User data is not a valid object or id is not a valid string.'));
		}
		
		var ObjectID = mongoose.Types.ObjectId;  
		let userObj = {$set: {}};
		let file:any = files;
		let front = file.front;
		let back = file.back;
		
		for(var param in userData) {
			userObj.$set[type+'.data.'+param] = userData[param];
		}
		
		Users.createHistory(id, type);

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
					historyObj.$push[type+'.histories'] = {"date": Date.now, "data": history_data};
					Users
						.findByIdAndUpdate(id, historyObj)
						.exec((err, saved) => {
							err ? reject(err)
							: resolve(saved);
						});
				}
			})
	})
})

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
					Users
						.update({"_id": id},{
							$set:
							{
								"verification.verified": true, 
								"verification.verified_date": Date.now()
							}
						})
						.exec((err, updated) => {
							err ? reject(err)
									: resolve(updated);
						});
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

let Users = mongoose.model('Users', usersSchema);

export default Users;