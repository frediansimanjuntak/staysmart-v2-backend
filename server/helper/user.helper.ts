import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import usersSchema from '../api/v2/users/model/users-model';
import Managers from '../api/v2/managers/dao/managers-dao';

export class userHelper{
	static meHelper(data, headers) {
		return new Promise((resolve:Function, reject:Function) => {
			let result: any = data;
			let header: any = headers;
			if (header.from && header.from == 'Mobile') {
				let auth = header.authorization;
				let auth_code = auth.slice(7);
				let front_landlord;
				let back_landlord;
				let front_tenant;
				let back_tenant;
				if (result.landlord.data.identification_proof.front){
					front_landlord = result.landlord.data.identification_proof.front.url	
				}
				else {
					front_landlord = null;
				}
				if (result.landlord.data.identification_proof.back != null) {
					back_landlord = result.landlord.data.identification_proof.back.url;
				}
				else {
					back_landlord = null;
				}
				if (result.tenant.data.identification_proof.front){
					front_tenant = result.tenant.data.identification_proof.front.url	
				}
				else {
					front_tenant = null;
				}
				if (result.tenant.data.identification_proof.back != null) {
					back_tenant = result.tenant.data.identification_proof.back.url;
				}
				else {
					back_tenant = null;
				}
				let type;
				if (result.companies.length > 0) {
					type = 'company';
				}
				else {
					type = 'individu';
				}
				let status = result.verification.verified;
				if (status == true) {
					status = 'verified';
				}
				else {
					status = 'unverified';
				}
				let landlord_data = {
					full_name: result.landlord.data.name,
					type: result.landlord.data.identification_type,
					id_number: result.landlord.data.identification_number,
					user: result._id,
					identity_front: front_landlord,
					identity_back: back_landlord,
					owner: result.landlord.data.owners,
					type_landlord: type
				};
				let tenant_data = {
					_id: '',
					user: result._id,
					phone: result.phone,
					confirmation_status: status,
					data: {
						identity_back: back_tenant,
						identity_front: front_tenant,
						name: result.tenant.data.name,
						id_no: result.tenant.data.identification_number,
						type: result.tenant.data.identification_type
					}
				};
				Managers
					.find({"manager": result._id, "status": "pending"}, '-_id property')
					.exec((err, res) => {
						if (err) {
							reject({message: err.message});
						}
						else {
							resolve({
								authorization: auth_code,
								_id: result._id,
								profil: {
									forgot: {
										code: result.reset_password.token,
										expire: result.reset_password.expired_at
									}
								},
								username: result.username,
								email: result.email,
								roles: result.role,
								landlord: landlord_data,
								tenant: tenant_data,
								picture: result.picture.url,
								owned_property: result.owned_properties,
								managed_property: result.managed_properties,
								appointed_property: res
							});
						}
					})
			}
			else {
				resolve(result);
			}
		});
	}

	static signUpHelper(userId, token, userData, headers) {
		return new Promise((resolve:Function, reject:Function) => {
			let data: any = userData;
			let header: any = headers;
			if (header.from && header.from == 'Mobile') {
				let auth = header.authorization;
				let auth_code = auth.slice(7);
				let tenant_data = {
					_id: '',
					user: data._id,
					phone: data.phone,
					verification: {
						code: data.verification.code,
						expire: data.verification.expires
					}
				};
				resolve({
					authorization: auth_code,
					_id: data._id,
					username: data.username,
					email: data.email,
					roles: data.role,
					tenant: tenant_data,
					picture: data.picture.url
				});
			}
			else {
				resolve({userId: userId, token});
			}
		});
	}

	static activationHelper(userId, headers) {
		return new Promise((resolve:Function, reject:Function) => {
			let data: any = userData;
			let header: any = headers;
			if (header.from && header.from == 'Mobile') {
				let auth = header.authorization;
				let auth_code = auth.slice(7);
				let status = data.verification.verified;
				if (status == true) {
					status = 'verified';
				}
				else {
					status = 'unverified';
				}
				let type;
				if (data.companies.length > 0) {
					type = 'company';
				}
				else {
					type = 'individu';
				}
				let front_landlord;
				let back_landlord;
				if (data.landlord.data.identification_proof.front){
					front_landlord = data.landlord.data.identification_proof.front.url	
				}
				else {
					front_landlord = null;
				}
				if (data.landlord.data.identification_proof.back != null) {
					back_landlord = data.landlord.data.identification_proof.back.url;
				}
				else {
					back_landlord = null;
				}
				let landlord_data = {
					full_name: data.landlord.data.name,
					type: data.landlord.data.identification_type,
					id_number: data.landlord.data.identification_number,
					user: data._id,
					identity_front: front_landlord,
					identity_back: back_landlord,
					owner: data.landlord.data.owners,
					type_landlord: type
				};
				let tenant_data = {
					_id: '',
					user: data._id,
					phone: data.phone,
					verification: {
						code: data.verification.code,
						expire: data.verification.expires
					},
					confirmation_status: status,
					verified_date: data.verification.verified_date
				};
				Managers
					.find({"manager": userId, "status": "pending"}, '-_id property')
					.exec((err, res) => {
						if (err) {
							reject({message: err.message});
						}
						else {
							resolve({
								authorization: auth_code,
								_id: data._id,
								username: data.username,
								email: data.email,
								roles: data.role,
								landlord: landlord_data,
								tenant: tenant_data,
								picture: data.picture.url,
								owned_property: data.owned_properties,
								managed_property: data.managed_properties,
								appointed_property: res,
								message: 'success'
							});
						}
					});
			}
			else {
				resolve({message: 'user verified.'});	
			}
		});
	}
}
