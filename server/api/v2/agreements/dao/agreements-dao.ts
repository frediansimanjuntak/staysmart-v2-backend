import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import agreementsSchema from '../model/agreements-model';
import Users from '../../users/dao/users-dao';
import Payments from '../../payments/dao/payments-dao';
import Attachments from '../../attachments/dao/attachments-dao';
import Appointments from '../../appointments/dao/appointments-dao';
import Developments from '../../developments/dao/developments-dao';
import Notifications from '../../notifications/dao/notifications-dao';
import Properties from '../../properties/dao/properties-dao';
import Chats from '../../chats/dao/chats-dao';
import {mail} from '../../../../email/mail';
import {socketIo} from '../../../../server';
import {GlobalService} from '../../../../global/global.service';

agreementsSchema.static('getAgreement', (query:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements
			.find(query)
			.populate("inventory_list.data.lists.items.attachments tenancy_agreement.data.stamp_certificate room letter_of_intent.data.tenant.identification_proof.front letter_of_intent.data.tenant.identification_proof.back letter_of_intent.data.occupiers.identification_proof.front letter_of_intent.data.occupiers.identification_proof.back letter_of_intent.data.landlord.identification_proof.front letter_of_intent.data.landlord.identification_proof.back")
			.populate({
				path: 'landlord',
				model: 'Users',
	            populate: {
	              path: 'picture',
	              model: 'Attachments'
	            },
	            select: 'username email picture landlord.data phone'
			})
			.populate({
				path: 'tenant',
				model: 'Users',
	            populate: {
	              path: 'picture',
	              model: 'Attachments'
	            },
	            select: 'username email picture landlord.data phone'
			})
			.populate({
				path: 'appointment',
				populate: [{
					path: 'tenant',
					model: 'Users'
				}, {
					path: 'landlord',
					model: 'Users'
				}, {
					path: 'property',
					model: 'Properties',
		            populate: [{
		              path: 'pictures.living',
		              model: 'Attachments'
		            },{
		              path: 'pictures.dining',
		              model: 'Attachments'
		            },{
		              path: 'pictures.bed',
		              model: 'Attachments'
		            },{
		              path: 'pictures.toilet',
		              model: 'Attachments'
		            },{
		              path: 'pictures.kitchen',
		              model: 'Attachments'
		            },{
		              path: 'development',
		              model: 'Developments'
		            }]
				}]
			})
			.populate({
				path: 'property',
	            populate: [{
					path: 'development',
					model: 'Developments'
				},{
					path: 'pictures.living',
					model: 'Attachments'
	            },{
					path: 'pictures.dining',
					model: 'Attachments'
	            },{
					path: 'pictures.bed',
					model: 'Attachments'
	            },{
					path: 'pictures.toilet',
					model: 'Attachments'
	            },{
					path: 'pictures.kitchen',
					model: 'Attachments'
	            }]
			})	
			.populate({
				path: 'letter_of_intent.data.appointment',
				populate: [{
					path: 'tenant',
					model: 'Users'
				}, {
					path: 'landlord',
					model: 'Users'
				}, {
					path: 'property',
					model: 'Properties',
		            populate: [{
		              path: 'pictures.living',
		              model: 'Attachments'
		            },{
		              path: 'pictures.dining',
		              model: 'Attachments'
		            },{
		              path: 'pictures.bed',
		              model: 'Attachments'
		            },{
		              path: 'pictures.toilet',
		              model: 'Attachments'
		            },{
		              path: 'pictures.kitchen',
		              model: 'Attachments'
		            },{
		              path: 'development',
		              model: 'Developments'
		            }]
				}]
			})
			.populate({
				path: 'letter_of_intent.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				}]
			})			
			.populate({
				path: 'tenancy_agreement.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				}]
			})						
			.populate({
				path: 'letter_of_intent.data.property ',
				model: 'Properties',
	            populate: [{
					path: 'development',
	              	model: 'Developments'
				},{
	              path: 'pictures.living',
	              model: 'Attachments'
	            },{
	              path: 'pictures.dining',
	              model: 'Attachments'
	            },{
	              path: 'pictures.bed',
	              model: 'Attachments'
	            },{
	              path: 'pictures.toilet',
	              model: 'Attachments'
	            },{
	              path: 'pictures.kitchen',
	              model: 'Attachments'
	            }]
			})		
			.exec((err, agreements) => {
				err ? reject({message: err.message})
					: resolve(agreements);
			});
	});
});

agreementsSchema.static('getAllAgreement', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {};
		Agreements.getAgreement(_query).then((res) => {
			resolve(res);
		})
		.catch(err => {
			reject({message: err.message});
		})
	});
});

agreementsSchema.static('getAll', (userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {		
		let _query = {$or: [{"tenant": userId},{"landlord":userId}] };
		Agreements.getAgreement(_query).then((res) => {
			resolve(res);
		})
		.catch(err => {
			reject({message: err.message});
		})
	});
});


agreementsSchema.static('getByUser', (userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {

		let _query = {$or: [{"tenant": userId},{"landlord":userId}] };
		Agreements.getAgreement(_query).then((res) => {
			resolve(res);
		})		
		.catch(err => {
			reject({message: err.message});
		})
	});
});

agreementsSchema.static('getById', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let _query = {"_id": id};
		Agreements.getAgreement(_query).then((res) => {
			_.each(res, (result) => {
				if (result.landlord._id == IDUser || result.tenant._id == IDUser || role == "admin") {
					resolve(result);
				}
				else {
					reject({message:"forbidden"});
				}
			})		
		})
		.catch((err) => {
			reject({message: err.message});
		})
	});
});

agreementsSchema.static('getAllHistory', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {$and: [{"letter_of_intent.data.status": "accepted"},{"tenancy_agreement.data.status": "accepted"}]};
		Agreements.getAgreement(_query).then((res) => {
			resolve(res);
		})
		.catch((err) => {
			reject({message: err.message});
		})
	});
});

agreementsSchema.static('getOdometer', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {};
		Agreements
			.find(_query)
			.exec((err, res)=> {
				if (err) {
					reject({message: err.message});
				}
				else if (res) {
					var taDocs = res;
					var savedComission = 12100;
					var calculation = 0;
					for (var i = 0; i < taDocs.length; i++) {
						let ta = taDocs[i];
						let taData = ta.tenancy_agreement.data;
						let loiData = ta.letter_of_intent.data;
						let n;
						let x;
						let cal;
						if (taData.status == 'accepted') {
						  if (!loiData.renewal) {
						    x = loiData.monthly_rental;
						    if (loiData.term_lease <= 12) {
						      n = 12;
						    } else {
						      n = loiData.term_lease;
						    }
						    if (x <= 4000) {
						      cal = n/24 * x *2;
						    } else if (x > 4000) {
						      cal = n/24 * x;
						    }
						    savedComission += cal;
						  }
						}
						else {
							savedComission = savedComission;
						}
					}			
					resolve({odometer: savedComission});
				}
			})
	});
});

agreementsSchema.static('loiSeen', (id: string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements.updateSeen('loi', id, userId).then(res => {
			resolve(res);
		})
	});
});

agreementsSchema.static('taSeen', (id: string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements.updateSeen('ta', id, userId).then(res => {
			resolve(res);
		})
	});
});

agreementsSchema.static('updateSeen', (type: string, id: string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let t = ['ta', 'loi'];
		if (t.indexOf(type) == -1) {
			reject({message: 'wrong type'});
		}
		else {
			let _query;
			Agreements.findById(id).exec((err, res) => {
				if (err) { reject({message: err.message}); }
				else {
					let user_type;
					if (userId == res.tenant) { user_type = 'tenant'; }
					else if (userId == res.landlord) { user_type = 'landlord'; }
					else { reject({message: 'You not a member of this agreement.'}); }
					if (user_type == 'tenant') {
						if (type == 'loi') {
							res.letter_of_intent.data.tenant_seen = true;
						}
						else {
							res.tenancy_agreement.data.tenant_seen = true;
						}
					}
					else {
						if (type == 'loi') {
							res.letter_of_intent.data.landlord_seen = true;
						}
						else {
							res.tenancy_agreement.data.landlord_seen = true;
						}
					}
					res.save((err, saved) => {
						err ? reject({message: err.message})
							: resolve({
								message: 'success',
								code: 200,
								data: [1]
							});
					})
				}
			})
		}
	});
});

agreementsSchema.static('createAgreements', (agreements:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}
		let body:any = agreements;
		let IDUser = userId.toString();
		if (!body.property) {
			reject({message: 'no property id'});
		}
		else {
			Properties
				.findById(body.property)
				.exec((err, properties) => {
					if (err) {
						reject({message: err.message});
					}
					else if (properties) {
						let propertyId = properties._id;
						let propertyStatus = properties.status;
						let landlordId = properties.owner.user;
						if (landlordId == userId) {
							resolve({message: "You can not create agreement with your owned property"});
						}
						else if (landlordId != userId) {
							Agreements
								.findOne({"property": body.property, "tenant": userId})
								.exec((err, agreement) => {
									if (err) {
										reject({message: err.message});
									}
									else if (agreement) {
										let roomId;
										if (agreement.room) {
											roomId = agreement.room;
											resolve({_id: agreement._id, room: roomId, message: "agreement has been made"})
										}
										else if (!agreement.room) {
											let landlord = agreement.landlord.toString();
											let tenant = agreement.tenant.toString();
											let property = agreement.property.toString();
											if (body.room) {
												Appointments.updateAppointmentsRoomId(landlord, tenant, property, body.room);
												agreement.room = body.room;
												agreement.save((err, saved) => {
													err ? reject({message: err})
														: resolve({_id: saved._id, room: saved.room, message: "agreement room Id updated"});
												})
											}
											else {
												resolve({_id: agreement._id, message: "agreement has been made"});
											}											
										}										
									}
									else {
										if (propertyStatus == "published" || propertyStatus == "initiated") {
											var _agreements = new Agreements(agreements);
											_agreements.property = propertyId;
											_agreements.tenant =  userId;
											_agreements.landlord = landlordId;
											if (body.appointment) {
												_agreements.appointment = body.appointment;
											}
											if (body.room) {
												_agreements.room = body.room;
											}
											_agreements.save((err, saved) => {
												err ? reject({message: err})
													: resolve({_id: saved._id});
											});
										}
										else if (propertyStatus == "rented") {
											reject({message: "this property has rented"})
										}
										else {
											reject({message: "this property not published"})
										}
									}															
								});	
						}										
					}
				});		
		}
	});
});

agreementsSchema.static('deleteAgreements', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Agreements
			.findByIdAndRemove(id)
			.exec((err, deleted) => {
				err ? reject({message: err.message})
					: resolve({message: "delete success"});
			});
	});
});

agreementsSchema.static('updateAgreements', (id:string, agreements:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}
		Agreements
			.findByIdAndUpdate(id, agreements)
			.exec((err, updated) => {
				err ? reject({message: err.message})
					: resolve(updated);
			});
	});
});

//LOI
agreementsSchema.static('getAllLoi', (userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let IDUser = userId.toString();
		let _query = { $or: [{"landlord": userId}, {"tenant": userId}]};
		Agreements
			.find(_query)
			.populate("landlord tenant letter_of_intent.data.appointment letter_of_intent.data.tenant.identification_proof.front letter_of_intent.data.tenant.identification_proof.back letter_of_intent.data.landlord.identification_proof.front letter_of_intent.data.landlord.identification_proof.back")
			.populate({
				path: 'property',
	            populate: [{
					path: 'development',
					model: 'Developments'
				},{
					path: 'pictures.living',
					model: 'Attachments'
	            },{
					path: 'pictures.dining',
					model: 'Attachments'
	            },{
					path: 'pictures.bed',
					model: 'Attachments'
	            },{
					path: 'pictures.toilet',
					model: 'Attachments'
	            },{
					path: 'pictures.kitchen',
					model: 'Attachments'
	            }]
			})	
			.populate({
				path: 'letter_of_intent.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				}]
			})
			.populate({
				path: "letter_of_intent.data.property",
				model: 'Properties',
	            populate: [{
	              path: 'pictures.living',
	              model: 'Attachments'
	            },{
	              path: 'pictures.dining',
	              model: 'Attachments'
	            },{
	              path: 'pictures.bed',
	              model: 'Attachments'
	            },{
	              path: 'pictures.toilet',
	              model: 'Attachments'
	            },{
	              path: 'pictures.kitchen',
	              model: 'Attachments'
	            },{
	              path: 'development',
	              model: 'Developments'
	            }]
			})	
			.sort({'letter_of_intent.data.created_at': -1})
			.exec((err, loi) => {
				if (err) {
					reject({message: err.message});
				}
				if (loi) {
					let datas = [];
					for (var i = 0; i < loi.length; i++) {
						let loiArr = loi[i];
						if (loiArr.letter_of_intent.data) {
							let status;
							let history = false;
							if (loiArr.tenancy_agreement.data.status) {
								let taStatus = loiArr.tenancy_agreement.data.status;
								if (taStatus == "draft" || taStatus == "rejected" || taStatus == "expired") {
									status = false;
								}
								else {
									status = true;
								}
							}
							else {
								status = false;
							}
							if(loiArr.letter_of_intent.histories.length > 0){
								if(loiArr.tenancy_agreement.histories.length > 0){
									for (var j = 0; j < loiArr.letter_of_intent.histories.length; j++) {
										if (loiArr.letter_of_intent.histories[j].delete == false) {
											history = true;
										}
									}
								}
							}
							let data = {
								"_idAgreement": loiArr._id,
								"landlord": loiArr.landlord,
								"tenant": loiArr.tenant,
								"property": loiArr.property,
								"letter_of_intent": loiArr.letter_of_intent.data,
								"tenancy_agreement": status,
								"history": history
							}
							datas.push(data);
						}
					}
					resolve(datas);
				}
			})		
	});
});

agreementsSchema.static('getLoiHistories', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let IDUser = userId.toString();
		let _query;
		if (role == "admin") {
			_query = {"_id": id};
		}
		else {
			_query = { $or: [{"landlord": userId}, {"tenant": userId}], "_id": id};
		}
		Agreements
			.findOne(_query)
			.populate("landlord tenant letter_of_intent.data.appointment letter_of_intent.data.tenant.identification_proof.front letter_of_intent.data.tenant.identification_proof.back letter_of_intent.data.landlord.identification_proof.front letter_of_intent.data.landlord.identification_proof.back")
			.populate({
				path: 'property',
	            populate: [{
					path: 'development',
					model: 'Developments'
				},{
					path: 'pictures.living',
					model: 'Attachments'
	            },{
					path: 'pictures.dining',
					model: 'Attachments'
	            },{
					path: 'pictures.bed',
					model: 'Attachments'
	            },{
					path: 'pictures.toilet',
					model: 'Attachments'
	            },{
					path: 'pictures.kitchen',
					model: 'Attachments'
	            }]
			})	
			.populate({
				path: 'letter_of_intent.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				}]
			})
			.populate({
				path: "letter_of_intent.data.property",
				model: 'Properties',
	            populate: [{
	              path: 'pictures.living',
	              model: 'Attachments'
	            },{
	              path: 'pictures.dining',
	              model: 'Attachments'
	            },{
	              path: 'pictures.bed',
	              model: 'Attachments'
	            },{
	              path: 'pictures.toilet',
	              model: 'Attachments'
	            },{
	              path: 'pictures.kitchen',
	              model: 'Attachments'
	            },{
	              path: 'development',
	              model: 'Developments'
	            }]
			})	
			.exec((err, loi) => {
				if (err) {
					reject({message: err.message});
				}
				else if (loi) {
					let datas = [];
					if(loi.letter_of_intent){
						if (loi.letter_of_intent.histories.length > 0) {
							let histories = loi.letter_of_intent.histories;							
							for (var j = 0; j < histories.length; j++) {
								let history = histories[j];
								if (history.delete == false) {
									let data = {
										"_idAgreement": loi._id,
										"landlord": loi.landlord,
										"tenant": loi.tenant,
										"property": loi.property,
										"_idHistories": history._id,
										"delete": history.delete,
										"history_date": history.date,
										"letter_of_intent": history.data
									}
									datas.push(data);							
								}								
							}								
						}
					}					
					resolve(datas);
				}
				else {
					reject({message: "no data exists in your account"});
				}
			})		
	});
});

agreementsSchema.static('getLoi', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let _query = {"_id": id};
		Agreements.getAgreement(_query).then(res => {
			if (res) {
				_.each(res, (result) => {
					if (result.landlord._id == IDUser || result.tenant._id == IDUser || role == "admin") {
						resolve(result.letter_of_intent.data);
					}
					else {
						reject({message:"forbidden"});
					}
				})				 
			}
			else {
				resolve({message: "no data"});
			}
		})
		.catch((err)=> {
			reject({message: err.message});
		})		
	});
});

agreementsSchema.static('createLoiAppointment', (id:string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) {
					reject({message: err.message});
				}
				else {
					let agreementId = appointment.agreement;
					let statusAppointment = appointment.status;
					Agreements
						.findById(agreementId)
						.exec((err, agreement) => {
							if (err) {
								reject({message: err.message});
							}
							else if (agreement) {
								agreement.appointment = id;
								agreement.save((err, saved) => {
									if (err) {
										reject({message: err.message});
									}
									else if (saved) {
										if (statusAppointment == "archived") {
											if (saved.appointment == id.toString() && agreement._id == agreementId.toString()) {
												let statusLoi = agreement.letter_of_intent.data.status;
												if (statusLoi  == "rejected" || statusLoi == "expired") {
													resolve({message: "create Loi"});
												}
												else {
													Agreements.getLoi(agreementId.toString(), userId).then(res => {
														if (res.created_at) {
															resolve({message: "forbidden"});
														}
														else {
															resolve({message: "create Loi"});
														}
													})
													.catch((err) => {
														reject({message: err.message});
													})
												}
											}
											else {
												reject({message: "forbidden"});
											}
										}
										else {
											reject({message: "Appointment not same"});
										}
									}
								})																
							}								
						})
				}
			})		
	});
});

agreementsSchema.static('getTotalLOINeedApprove', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let today = new Date();
		Agreements
			.find({"letter_of_intent.data.status": "pending"})
			.where("letter_of_intent.data.created_at").lte(today)
			.exec((err, agreements) => {
				if (err) {
					reject({message: err.message});
				}
				else if (agreements) {
					let data = { total: agreements.length }
					socketIo.socket(data, 'counterLOI');
					resolve(data);
				}
			})
	});
});

agreementsSchema.static('checkLOIStatus', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let typeDataa = "letter_of_intent";
		Agreements
			.findById(id)
			.exec((err, agreement) => {
				if (err) { reject(err); }
				else if (agreement) {
					let loi = agreement.letter_of_intent.data;
					if (loi.created_at || loi.status == "rejected" || loi.status == "expired") {
						Agreements.createHistory(id, typeDataa).then((res) => {
							Agreements
								.update({"_id": id}, {
									$unset: {
										"letter_of_intent.data": ""
									}
								})
								.exec((err, updated) => {
									err ? reject (err)
										: resolve (updated);
								})
						})
						.catch((err) => {
							reject(err)
						})
					}
					else {
						resolve({message: "LOI Already Exist"});
					}	
				}
				else { reject({message: "Agreement not found"}); }
			})
	});
});

agreementsSchema.static('createLoi', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('LOI is not a valid object.'));
		}		
		let bodies:any = data;	
		let body:any = GlobalService.validObjectEmpty(data);
		
		let tenant = body.tenant;
		let IDUser = userId.toString();
		let inputBankNo = body.tenant.bank_account.no;
		Agreements
			.findById(id)
			.populate("landlord tenant property appointment")
			.exec((err, agreement) => {
				if (agreement) {				
					let tenantID = agreement.tenant._id;
					let loi = agreement.letter_of_intent.data;
					if (tenantID != IDUser) {
						resolve({message: "forbidden"});
					}
					else if (tenantID == IDUser) {
						Agreements.checkLOIStatus(id).then((res) => {
							let landlordData = agreement.landlord.landlord.data;
							let tenantID = agreement.tenant._id;
							let propertyID = agreement.property._id;
							let landlordID = agreement.landlord._id;
							let tenant = body.tenant;
							Agreements.userUpdateDataTenant(tenantID.toString(), tenant);						
							let monthly_rental = body.monthly_rental;
							let term_lease = body.term_lease;
							let security_deposit = GlobalService.calcSecurityDeposit(term_lease, monthly_rental)
							let gfd_amount = monthly_rental;
							let sd_amount = GlobalService.calcSDA(term_lease, monthly_rental);
							let remark = body.remark_payment;
							let term_payment = GlobalService.calcTermPayment(term_lease);
							// let term_lease_extend = GlobalService.termLeaseExtend(term_lease);
							let term_lease_extend = 0;
							let _query = {"_id": id};
							let loiObj = {$set: {}};
							for(var param in body) {
								loiObj.$set["letter_of_intent.data." + param] = body[param];
							}
							loiObj.$set["letter_of_intent.data.date_commencement"] = new Date(body.date_commencement);
							loiObj.$set["letter_of_intent.data.gfd_amount"] = gfd_amount;
							loiObj.$set["letter_of_intent.data.sd_amount"] = sd_amount;
							loiObj.$set["letter_of_intent.data.term_payment"] = term_payment;
							loiObj.$set["letter_of_intent.data.term_lease_extend"] = term_lease_extend;
							loiObj.$set["letter_of_intent.data.lapse_offer"] = 7;
							loiObj.$set["letter_of_intent.data.minor_repair_cost"] = 200;
							loiObj.$set["letter_of_intent.data.security_deposit"] = security_deposit;
							loiObj.$set["letter_of_intent.data.landlord"] = landlordData;
							loiObj.$set["letter_of_intent.data.status"] = "draft";
							loiObj.$set["letter_of_intent.data.created_at"] = new Date();
							loiObj.$set["letter_of_intent.data.property"] = propertyID;
							if (agreement.appointment) {
								let appointmentID = agreement.appointment._id;
								loiObj.$set["letter_of_intent.data.appointment"] = appointmentID;
							}
							Agreements
								.update(_query, loiObj)
								.exec((err, updated) => {
									err ? reject({message: err.message})
										: resolve({message: "Loi created"});
								});
						})
						.catch((err) => {
							reject(err);
						})									
					}
				}
				else if (err) {
					reject({message: err.message});
				}	
			})		
	});
});

agreementsSchema.static('userUpdateDataTenant', (id:string, data:Object,):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = data;
		Users
			.findById(id)
			.exec((err, res) => {
				if (err) {
					reject({message: err.message});
				}
				else if (res) {
					if (res.tenant.data.name) {
						let tenantData = res.tenant.data;
						Agreements.historyDataTenant(id, tenantData);
					}
					Users
						.update({"_id": id}, {
							$set: {
								"tenant.data": {
									"name": body.name,
									"identification_type": body.identification_type,
									"identification_number": body.identification_number,
									"identification_proof": {
										"front": body.identification_proof.front,
										"back": body.identification_proof.back
									},
									"bank_account": {
										"bank": body.bank_account.bank,
										"name": body.bank_account.name,
										"no": body.bank_account.no
									}
								}
							}
						}, {upsert: true})
						.exec((err, saved) => {
						err ? reject({message: err.message})
            				: resolve(saved);
						})
				}
				else {
					reject({message: "User not found"});
				}
			})		
	});
});

agreementsSchema.static('initiateLoi', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('LOI is not a valid object.'));
		}		
		let body:any = GlobalService.validObjectEmpty(data);
		let IDUser = userId.toString();	
		let typeDataa = "letter_of_intent";	
			
		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) { reject({message: err.message}); }
				else if (appointment) {
					let idAgreement = appointment.agreement;
					Agreements
						.findById(idAgreement)
						.populate("landlord tenant property appointment")
						.exec((err, agreement) => {
							if (err) { reject({message: err.message}); }
							else if (agreement) {
								let propertyID = agreement.property._id;
								let landlordID = agreement.landlord._id;
								let landlordData = agreement.landlord.landlord.data;
								let tenantID = agreement.tenant._id;
								let tenantData = agreement.tenant.tenant.data;
								if (tenantID != IDUser) {
									resolve({message: "forbidden"});
								}
								else if (tenantID == IDUser) {
									Agreements.checkLOIStatus(id).then((res) => {						
										let occupiers;
										let tenant;
										if (body.tenant) {
											tenant = {
												'name': body.tenant.name,
												'identification_type': body.tenant.type,
												'identification_number': body.tenant.id_no,
												'identification_proof': {
													'front': body.tenant.identity_front,
													'back': body.tenant.identity_back
												},
												'bank_account': {
													'bank':body.bank_refund.bank_id,
													'name': body.bank_refund.name,
													'no': body.bank_refund.no
												}
											};
											Agreements.userUpdateDataTenant(tenantID.toString(), tenant);
										}				
										if (body.occupants) {
											occupiers = {
												'name': body.occupants.name,
												'identification_type': body.occupants.type,
												'identification_number': body.occupants.id_no,
												'identification_proof': {
													'front': body.occupants.identity_front,
													'back': body.occupants.identity_back
												}
											};
										}
										let _query = {"_id": id};
										let loiObj = {$set: {}};
										let monthly_rental = body.monthly_rental;
										let term_lease = body.term_lease;
										let gfd_amount = monthly_rental;
										let security_deposit = GlobalService.calcSecurityDeposit(term_lease, monthly_rental);
										let sd_amount = GlobalService.calcSDA(term_lease, monthly_rental);
										let term_payment = GlobalService.calcTermPayment(term_lease);
										// let term_lease_extend = GlobalService.termLeaseExtend(term_lease);
										let term_lease_extend = 0;
										let remark = body.remark_payment;
										loiObj.$set["letter_of_intent.data.tenant"] = tenant;
										loiObj.$set["letter_of_intent.data.occupiers"] = occupiers;
										loiObj.$set["letter_of_intent.data.monthly_rental"] = body.monthly_rental;
										loiObj.$set["letter_of_intent.data.date_commencement"] = new Date(body.date_commencement);
										loiObj.$set["letter_of_intent.data.tenant.not_occupier"] = body.populate_tenant;
										loiObj.$set["letter_of_intent.data.gfd_amount"] = gfd_amount;
										loiObj.$set["letter_of_intent.data.sd_amount"] = sd_amount;
										loiObj.$set["letter_of_intent.data.term_payment"] = term_payment;
										loiObj.$set["letter_of_intent.data.term_lease_extend"] = term_lease_extend;
										loiObj.$set["letter_of_intent.data.lapse_offer"] = 7;
										loiObj.$set["letter_of_intent.data.minor_repair_cost"] = 200;
										loiObj.$set["letter_of_intent.data.security_deposit"] = security_deposit;
										loiObj.$set["letter_of_intent.data.landlord"] = landlordData;
										loiObj.$set["letter_of_intent.data.status"] = "draft";
										loiObj.$set["letter_of_intent.data.created_at"] = new Date();
										loiObj.$set["letter_of_intent.data.property"] = propertyID;
										loiObj.$set["letter_of_intent.data.appointment"] = id;
										Agreements
											.update(_query, loiObj)
											.exec((err, updated) => {
												if (err) { reject({message: err.message}); }
												else {
													let result = {
														"message": "success",
														"code": 200,
														"data": {
															"_id": id
														}
													};
													resolve(result);
												}
											});
									})									
								}
							}
							else { reject({message: "Agreement not found"}); };
						})
				}
				else {
					reject({message: "Appointment not found"})
				}
			})	
	});
});

agreementsSchema.static('signLoi', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let body:any = data;
		let IDUser = userId.toString();	
		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) { reject({message: err.message}); }
				else if (appointment) {
					let idAgreement = appointment.agreement;
					Agreements
						.findById(idAgreement)
						.exec((err, agreement) => {
							if (err) { reject({message: err.message}); }
							else if (agreement) {
								if (agreement.tenant == IDUser) {
									if (body.signature) {
										let data = {
											"sign": body.signature,
											"type": "letter_of_intent",
											"status": "tenant"
										}
										Agreements.confirmation(id, data).then((res) => {
											if (!res.message) {
												resolve({"message": "success", "code": 200, "data": {"_id": idAgreement}});
											}
											else { reject(res); }
										})
										.catch((err) => { reject({message: err.message}); })
									}
									else {
										reject({message: "sign not found"});
									}
								}
								else { reject({message: "forbidden"}); }								
							}
							else { reject({message: "Agreement not found"}); }
						})
				}
				else { reject({message: "Appointment not found"}); }
			})
	});
});

agreementsSchema.static('acceptLoi_', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let body:any = data;
		let IDUser = userId.toString();	
		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) { reject({message: err.message}); }
				else if (appointment) {
					let idAgreement = appointment.agreement;
					Agreements
						.findById(idAgreement)
						.exec((err, agreement) => {
							if (err) { reject({message: err.message}); }
							else if (agreement) {
								if (agreement.landlord == IDUser) {
									if (body.signature) {
										let data = {
											"sign": body.signature,
											"type": "letter_of_intent",
											"status": "landlord"
										}
										Agreements.changeStatusChat(agreement.room.toString(), "pending");
										Agreements.confirmation(id, data);
										agreement.letter_of_intent.data.status = "accepted";
										agreement.save((err, saved) => {
											err ? reject({message: err.message})
												: resolve({"message": "success", "code": 200, "data": {"_id": idAgreement}});
										})
										.catch((err) => { reject({message: err.message}); })
									}	
									else {
										reject({message: "sign not found"});
									}								
								}
								else { reject({message: "forbidden"}); }								
							}
							else { reject({message: "Agreement not found"}); }
						})
				}
				else { reject({message: "Appointment not found"}); }
			})
	});
});

agreementsSchema.static('rejectLoi_', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let body:any = data;
		let IDUser = userId.toString();	
		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) { reject({message: err.message}); }
				else if (appointment) {
					let idAgreement = appointment.agreement;
					Agreements
						.findById(idAgreement)
						.populate("letter_of_intent.data.payment")
						.exec((err, agreement) => {
							if (err) { reject({message: err.message}); }
							else if (agreement) {
								if (agreement.landlord == IDUser) {
									let payment = agreement.letter_of_intent.data.payment;
									let statusLoi = agreement.letter_of_intent.data.status;
									let paymentId = payment._id;
									let paymentStatus = payment.status;
									let paymentFee = payment.fee;
									let typeMail = "rejectLoiLandlord";
									
									if (paymentStatus == "rejected") {
										resolve({message: "this payment has rejected"});
									}
									else if (paymentStatus == "pending" || paymentStatus == "accepted" || statusLoi == "payment-confirmed") {
										Agreements.changeNeedRefundAfterRejectLOI(paymentId, body.rejected_reason);
										agreement.letter_of_intent.data.status = "rejected";
										agreement.save((err, saved)=>{
											if (err) { reject({message: err.message}); }
											else if (saved) {
												Agreements.email(idAgreement, typeMail);
												resolve({"message": "success", "code": 200, "data": {"_id": idAgreement}});
											}
										});							
									}
								}
								else { reject({message: "forbidden"}); }								
							}
							else { reject({message: "Agreement not found"}); }
						})
				}
				else { reject({message: "Appointment not found"}); }
			})
	});
});

agreementsSchema.static('uploadPaymentLoi', (id:string, attachment:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		Appointments
			.findById(id)
			.select("agreement")
			.exec((err, appointment) => {
				if (err) {reject({message: err.message});}
				else if (appointment) {
					if (appointment.agreement) {
						let idAgreement = appointment.agreement._id;
						Agreements.updatePaymentProof(idAgreement, attachment, userId, "letter_of_intent");
						Agreements.sendLoi(id, userId);
						resolve(appointment);
					}				
				}
				else {
					reject({message: "Appointment not found"})
				}
			})
	});
});

agreementsSchema.static('updatePaymentProof', (id:string, attachment:Object, userId:string, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let files:any = attachment;
		let data = {body:"staysmart"};
		if (files.proof) {
			Attachments.createAttachments(files.proof, data).then((res) => {
				if (res.idAtt) {
					let idAttachments = res.idAtt;
					_.each(idAttachments, (result) => {
						let paymentData = {
							type : type,
							attachment : result
						};
						Agreements.payment(id, paymentData);									
					})	
					resolve(res);							
				}
				else {
					resolve({message: "Attachment file not found"});
				}
			})						
		}
		else {
			resolve({message: "Attachment file not found"});
		}	
	});
});

agreementsSchema.static('historyDataTenant', (id:string, tenantData:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Users
			.update({"_id": id}, {
				$push: {
					"tenant.histories": {
						"date": new Date(),
						"data": tenantData
					}
				}
			})
			.exec((err, update) => {
                  err ? reject({message: err.message})
                      : resolve(update);
            });
	});
});

agreementsSchema.static('sendLoi', (id:string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let IDUser = userId.toString();
		Agreements
			.findById(id)
			.populate("landlord tenant property appointment letter_of_intent.data.payment")
			.exec((err, agreement) => {
				if (err) {
					reject({message: err.message});
				}
				else if (agreement) {
					let tenantId = agreement.tenant._id;
					let propertyId = agreement.property._id;
					if (tenantId != IDUser) {
						resolve({message: "forbidden"});
					}
					else if (tenantId == IDUser) {
						agreement.letter_of_intent.data.status = "pending";
						agreement.save((err, saved) => {
							if (err) {
								reject({message: err.message});
							}
							else if (saved) {
								if (agreement.appointment) {
									Appointments
										.findById(agreement.appointment._id)
										.exec((err, res) => {
											if (err) {
												reject({message: err.message});
											}
											else if (res) {
												res.state = "initiate letter of intent";
												res.save((err, saved) => {
													err ? reject({message: err.message})
														: resolve(saved);
												});
											}
										})
								}
								Properties
									.update({"_id": propertyId}, {
										$set: {
											"status": "initiated"
										}
									})
									.exec((err, updated) => {
										if (err) {
											reject({message: err.message})
										}
										else if (updated) {
											let type = "initiateLoi";
											Agreements.email(id, type);
											Agreements.notification(id, type);
											Agreements.getTotalLOINeedApprove();
											resolve(updated);
										}
									})
							}
						});
					}
				}				
			})		
	});
});

agreementsSchema.static('acceptLoi', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let type_notif = "acceptLoi";
		let type = "letter_of_intent";	
		let IDUser = userId.toString();
		let body:any = data;
		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {
				if (err) {
					reject({message: err.message});
				}
				else if (agreement) {
					let landlordId
					if (agreement.landlord) {
						if (body.sign) {
							landlordId = agreement.landlord._id;
							if (landlordId != IDUser) {
								resolve({message: "forbidden"});
							}
							else if (landlordId == IDUser) {
								agreement.letter_of_intent.data.status = "accepted";
								agreement.save((err, saved) => {
									Agreements.confirmation(id, data, type);
									if (agreement.room) {
										Agreements.changeStatusChat(agreement.room.toString(), "pending");
									}								
									Agreements.notification(id, type_notif).then(res => {
										let typeMail = "acceptedLoiLandlord";
										Agreements.email(id, typeMail);
										resolve(saved);
									});
								})
							}
						}
						else {
							reject({message: "sign not found"});
						}
					}	
					else {
						resolve({message: "forbidden"});
					}						
				}		
				
			})			
	});
});

agreementsSchema.static('rejectLoi', (id:string, userId:string, role:string, loi:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let body:any = loi;
		Agreements
			.findById(id)
			.populate("landlord tenant letter_of_intent.data.payment")
			.exec((err, agreement) => {				
				if (err) {
					reject({message: err.message});
				}
				else if (agreement) {
					let landlordID = agreement.landlord._id;
					if (landlordID != IDUser) {
						resolve({message: "forbidden"});
					}
					else if (landlordID == IDUser || role == 'admin') {
						let payment = agreement.letter_of_intent.data.payment;
						let statusLoi = agreement.letter_of_intent.data.status;
						let paymentId = payment._id;
						let paymentStatus = payment.status;
						let paymentFee = payment.fee;
						if (paymentStatus == "rejected") {
							resolve({message: "this payment has rejected"});
						}
						else if (paymentStatus == "pending" || paymentStatus == "accepted" || statusLoi == "payment-confirmed" || statusLoi == "pending") {
							Agreements.changeNeedRefundAfterRejectLOI(paymentId, body.reason);
							Agreements.updatePropertyStatusPayment(agreement.property, "published");
							agreement.letter_of_intent.data.status = "rejected";
							agreement.save((err, saved)=>{
								if (err) {
									reject({message: err.message})
								}
								else if (saved) {
									let typeMail;
									if (role == 'admin') {
										typeMail = "rejectLoiAdmin";
									}
									if (landlordID == IDUser) {
										typeMail = "rejectLoiLandlord";
									}
									Agreements.email(id, typeMail);
									Agreements.notification(id, "rejectLoi");
									resolve(saved);
								}
							});							
						}
					}						
				}
			})
	});
});

agreementsSchema.static('changeNeedRefundAfterRejectLOI', (id:string, reason:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Payments
			.findById(id)
			.exec((err, payment) => {
				if (err) { reject({message: err.message}); }
				else if (payment) {
					let fees = payment.fee;
					for (var i = 0; i < fees.length; i++) {
						Payments
							.update({"_id": id, "fee":{ $elemMatch: {"needed_refund": false}}}, {
								$set: {
									"fee.$.needed_refund": true,
									"fee.$.updated_at": new Date(),
									"remarks": reason
								},
							}, {multi: true})
							.exec((err, update) => {
								err ? reject({message: err.message})
									: resolve(update);
							})
					}
				}
				else { reject({message: "Payment Not Found"}); } 
			})		
	});
});

agreementsSchema.static('changeStatusChat', (id:string, status:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Chats
			.findByIdAndUpdate(id, {
				$set: {
					status: status
				}
			})
			.exec((err, updated) => {
				err ? reject({message: err.message})
					: resolve(updated)
			})
	});
});

agreementsSchema.static('GetLoiStep2', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) { reject({message: err.message}); }
				else if (appointment) {
					let idAgreement = appointment.agreement;
					Agreements
						.findById(idAgreement)
						.populate({
							path: 'landlord',
							model: 'Users',
							populate: [{
								path: 'picture',
								model: 'Attachments'
							}, {
								path: 'landlord.data.identification_proof.front',
								model: 'Attachments'
							}, {
								path: 'landlord.data.identification_proof.back',
								model: 'Attachments'
							}],
							select: 'username email picture landlord.data phone'
						})
						.populate({
							path: 'tenant',
							model: 'Users',
							populate: [{
								path: 'picture',
								model: 'Attachments'
							}, {
								path: 'tenant.data.identification_proof.front',
								model: 'Attachments'
							}, {
								path: 'tenant.data.identification_proof.back',
								model: 'Attachments'
							}],
							select: 'username email picture tenant.data phone'
						})
						.exec((err, agreement) => {
							if (err) { reject({message: err.message}); }
							else if (agreement) {
								let tenant = agreement.tenant.tenant.data;
								let landlord =  agreement.landlord.landlord.data;
								let tenantIdentityFront;
								let tenantIdentityBack;
								let landlordIdentityFront;
								let landlordIdentityBack;
								if (tenant.identification_proof.front) {
									tenantIdentityFront = {
										"_id": tenant.identification_proof.front._id,
										"url": tenant.identification_proof.front.url
									}
								}
								if (landlord.identification_proof.front) {
									landlordIdentityFront = {
										"_id": landlord.identification_proof.front._id,
										"url": landlord.identification_proof.front.url
									}
								}
								if (tenant.identification_proof.back) {
									tenantIdentityBack = {
										"_id": tenant.identification_proof.back._id,
										"url": tenant.identification_proof.back.url
									}
								}
								if (landlord.identification_proof.back) {
									landlordIdentityBack = {
										"_id": landlord.identification_proof.back._id,
										"url": landlord.identification_proof.back.url
									}
								}
								let data = {
									"tenant": {
										"name": tenant.name ? tenant.name : "",
										"type": tenant.identification_type ? tenant.identification_type : "",
										"id_no": tenant.identification_number ? tenant.identification_number : "",
										"identity_front": tenantIdentityFront ? tenantIdentityFront : "",
										"identity_back": tenantIdentityBack ? tenantIdentityBack : ""
									},
									"landlord": {
										"name": landlord.name ? landlord.name : "",
										"type": landlord.identification_type ? landlord.identification_type : "",
										"id_no": landlord.identification_number ? landlord.identification_number : "",
										"identity_front": landlordIdentityFront ? landlordIdentityFront : "",
										"identity_back": landlordIdentityBack ? landlordIdentityBack : ""
									}
								}
								resolve(data);
							}
							else {
								reject({message: "Agreement not found"});
							}
						})
				}
				else {
					reject({message: "Appointment not found"});
				}
			})
	});
});

//TA
agreementsSchema.static('getAllTa', (userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let IDUser = userId.toString();
		let _query = { $or: [{"landlord": userId}, {"tenant": userId}]};
		Agreements
			.find(_query)
			.populate("landlord tenant tenancy_agreement.data.stamp_certificate")
			.populate({
				path: 'property',
	            populate: [{
					path: 'development',
					model: 'Developments'
				},{
					path: 'pictures.living',
					model: 'Attachments'
	            },{
					path: 'pictures.dining',
					model: 'Attachments'
	            },{
					path: 'pictures.bed',
					model: 'Attachments'
	            },{
					path: 'pictures.toilet',
					model: 'Attachments'
	            },{
					path: 'pictures.kitchen',
					model: 'Attachments'
	            }]
			})	
			.populate({
				path: 'tenancy_agreement.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				}]
			})
			.exec((err, ta) => {
				if (err) {
					reject({message: err.message});
				}
				if (ta) {
					let datas = [];
					for(var i = 0; i < ta.length; i++) {
						let taArr = ta[i];
						if (taArr.tenancy_agreement.data) {
							let status;
							let history = false;
							if (taArr.inventory_list.data.status) {
								status = true;
							}
							else {
								status = false;
							}
							if(taArr.tenancy_agreement.histories.length > 0){
								for (var j = 0; j < taArr.tenancy_agreement.histories.length; j++) {
									if (taArr.tenancy_agreement.histories[j].delete == false) {
										history = true;
									}
								}
							}
							if(taArr.tenancy_agreement.data.status){
								let data = {
									"_idAgreement": taArr._id,
									"landlord": taArr.landlord,
									"tenant": taArr.tenant,
									"property": taArr.property,
									"tenancy_agreement": taArr.tenancy_agreement.data,
									"inventory_list": status,
									"history": history
								}
								datas.push(data);					
							}							
						}						
					}
					resolve(datas);
				}
			})		
	});
});

agreementsSchema.static('getTaHistories', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let IDUser = userId.toString();
		let _query;
		if (role == "admin") {
			_query = {"_id": id};
		}
		else {
			_query = {$and: [{ $or: [{"landlord": userId}, {"tenant": userId}] }, {"_id": id}]}
		}		
		Agreements
			.findOne(_query)
			.populate("landlord tenant tenancy_agreement.data.stamp_certificate")
			.populate({
				path: 'property',
	            populate: [{
					path: 'development',
					model: 'Developments'
				},{
					path: 'pictures.living',
					model: 'Attachments'
	            },{
					path: 'pictures.dining',
					model: 'Attachments'
	            },{
					path: 'pictures.bed',
					model: 'Attachments'
	            },{
					path: 'pictures.toilet',
					model: 'Attachments'
	            },{
					path: 'pictures.kitchen',
					model: 'Attachments'
	            }]
			})	
			.populate({
				path: 'tenancy_agreement.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				}]
			})
			.exec((err, ta) => {
				if (err) {
					reject({message: err.message});
				}
				else if (ta) {
					let datas = [];			
					if (ta.tenancy_agreement){
						if (ta.tenancy_agreement.histories.length > 0) {
							let histories = ta.tenancy_agreement.histories;							
							for(var j = 0; j < histories.length; j++) {
								let history = histories[j];
								if (history.delete == false) {
									let data = {
										"_idAgreement": ta._id,
										"landlord": ta.landlord,
										"tenant": ta.tenant,
										"property": ta.property,
										"_idHistories": history._id,
										"delete": history.delete,
										"history_date": history.date,
										"tenancy_agreement": history.data
									}
									datas.push(data);								
								}								
							}								
						}
					}
					resolve(datas);
				}
				else {
					reject({message: "no data exists in your account"});
				}
			})		
	});
});

agreementsSchema.static('getTA', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let _query = {"_id": id};
		Agreements.getAgreement(_query).then(res => {
			if (res) {
				_.each(res, (result) => {
					if (result.landlord._id == IDUser || result.tenant._id == IDUser || role == "admin") {
						resolve(result.tenancy_agreement.data);
					}
					else {
						reject({message:"forbidden"});
					}
				})				 
			}
			else {
				reject({message: "error"});
			}
		})
	});
});

agreementsSchema.static('getTotalTANeedApprove', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let today = new Date();
		Agreements
			.find({"tenancy_agreement.data.status": "admin-confirmation"})
			.where("tenancy_agreement.data.created_at").lte(today)
			.exec((err, agreements) => {
				if (err) {
					reject({message: err.message});
				}
				else if (agreements) {
					let data = { total: agreements.length }
					socketIo.socket(data, 'counterTA');
					resolve(data);
				}
			})
	});
});

agreementsSchema.static('createTA', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		let body:any = data;
		let bank = {
			"bank_id": body.bank,
			"bank_account_name": body.name,
			"bank_account_no": body.no
		}
		Agreements.initiateTA(id, bank, userId).then((res) => {
			resolve(res);
		})
		.catch((err) => {
			reject({message: err.message});
		})					
	});
});

agreementsSchema.static('initiateTA_', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		let body:any = data;
		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) { reject({message: err.message}); }
				else if (appointment) {
					if (appointment.agreement) {
						let idAgreement = appointment.agreement;
						Agreements.initiateTA(idAgreement, data, userId).then((res) => {
							resolve(res);
						})
						.catch((err) => {
							reject({message: err.message});
						})
					}
					else { reject({message: "Agreement not found"}); }
				}
				else { reject({message: "Appointment not found"}); }
			})						
	});
});

agreementsSchema.static('initiateTA', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = data;
		let type = "tenancy_agreement";
		let bankNo = body.bank_account_no;
		let IDUser = userId.toString();
		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {				
				if (err) {
					reject({message: err.message})
				}
				else if (agreement) {
					let landlordId = agreement.landlord._id;
					if (landlordId != IDUser) {
						resolve({message: "forbidden"});
					}
					else if (landlordId == IDUser) {
						Agreements.checkTAStatus(id).then((res) => {
							Agreements.checklandlordBank(landlordId, data);
							agreement.letter_of_intent.data.landlord.bank_account.no = body.bank_account_no;
							agreement.letter_of_intent.data.landlord.bank_account.name = body.bank_account_name;
							agreement.letter_of_intent.data.landlord.bank_account.bank = body.bank_id;	
							agreement.tenancy_agreement.data.status = "draft";
							agreement.tenancy_agreement.data.created_at = new Date();
							agreement.save((err, saved)=>{
								err ? reject({message: err.message})
									: resolve(saved);
							});
						})					
						.catch((err) => {
							reject(err);
						});
					}
				}
				else { reject({message: "Agreement not found"}); }
			})					
	});
});

agreementsSchema.static('checklandlordBank', (id:string, data:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
		let body:any = data;
		let bankNo = body.bank_account_no;
		let type = "tenancy_agreement";
		Users	
			.findById(id)
			.exec((err, user) => {
				if (err) { reject({message: err.message}); }
				else if (user) {
					if (user.landlord.data.bank_account) {
						let landlordDataBank = user.landlord.data.bank_account;
						Users
							.update({"_id": id}, {
								$push: {
									"landlord.histories": {
										"date": new Date(),
										"data": landlordDataBank
									}
								},
								$set: {
									"landlord.data.bank_account": {
										"no": body.bank_account_no,
										"name": body.bank_account_name,
										"bank": body.bank_id
									}
								}
							})
							.exec((err, updated) => {
								err ? reject({message: err.message})
									: resolve(updated);
							})
					}
					else {
						Users
							.update({"_id": id}, {
								$set: {
									"landlord.data.bank_account": {
										"no": body.bank_account_no,
										"name": body.bank_account_name,
										"bank": body.bank_id
									}
								}
							})
							.exec((err, updated) => {
								err ? reject({message: err.message})
									: resolve(updated);
							})
					}
				}
				else { reject({message: "user not found"}); }
			})
    });
});

agreementsSchema.static('checkTAStatus', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
		let type = "tenancy_agreement";
		Agreements
			.findById(id)
			.populate("landlord")
			.exec((err, agreement) => {
				if (err) { reject({message: err.message}); }
				else if (agreement) {
					if (agreement.tenancy_agreement.data) {
						let ta = agreement.tenancy_agreement.data;
						if (ta.created_at) {
							if (ta.status == "rejected" || ta.status == "expired") {
								Agreements.createHistory(id, type).then((res) => {
									Agreements
										.update({"_id": id}, {
											$unset: {
												"tenancy_agreement.data": ""
											}
										})
										.exec((err, updated) => {
											err ? reject(err)
												: resolve(ta);
										})
								})
								.catch((err) => {
									reject(err)
								})
							}
							else { resolve({message: "TA Already Exist"}); }
						}
						else { resolve({message: "TA not created"}); }
					}
					else { resolve({message: "TA not available"}); }
				}
				else {
					reject({message: "Agreement not found"});
				}
			})
    });
});

agreementsSchema.static('uploadPaymentTA', (id:string, attachment:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		Appointments
			.findById(id)
			.select("agreement")
			.exec((err, appointment) => {
				if (err) {reject({message: err.message});}
				else if (appointment) {
					if (appointment.agreement) {
						let idAgreement = appointment.agreement._id;
						Agreements.updatePaymentProof(idAgreement, attachment, userId, "tenancy_agreement");
						Agreements.sendTA(idAgreement.toString, attachment, userId);
						resolve(appointment);
					}				
				}
				else {
					reject({message: "Appointment not found"})
				}
			})
	});
});

agreementsSchema.static('sendTA', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		let IDUser = userId.toString();
		let body:any = data;		
		let type = "tenancy_agreement";
		let typeNotif = "initiateTA";
		let typeEmailLandlord = "initiateTaLandlord";
		let typeEmailTenant = "initiateTaTenant";
		Agreements
			.findById(id)
			.populate("landlord tenant appointment property")
			.exec((err, agreement) => {
				if (err) {
					reject({message: err.message});
				}
				else if (agreement) {
					let propertyId = agreement.property._id;
					let landlordId = agreement.landlord._id;
					if (landlordId != IDUser) {
						reject({message:"forbidden"});
					}
					else if (landlordId == IDUser) {
						if (body.sign) {
							agreement.tenancy_agreement.data.status = 'pending';
							agreement.save((err, saved) => {
								if (err) { reject(err); }
								else {
									if (agreement.appointment) {							
										Appointments
											.findById(agreement.appointment._id)
											.exec((err, res) => {
												if (err) {
													reject({message: err.message});
												}
												if (res) {
													res.state = "initiate tenancy agreement";
													res.save((err, saved) => {
														err ? reject({message: err.message})
															: resolve(saved);
													});
												}
											})
									}
									Agreements.confirmation(id, data, type);
									Agreements.email(id, typeEmailLandlord);
									Agreements.email(id, typeEmailTenant);
									Agreements.notification(id, typeNotif);
									resolve({message: "Send Ta Success"});
								}
							})								
						}
						else { reject({message: "sign not found"}); }						
					}
				}
		})
	});
});

agreementsSchema.static('createHistoryProperty', (id:string, typeDataa:string, data:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
		
		var historyObj = {$push: {}};  
		historyObj.$push[typeDataa+'.histories'] = {"date": new Date(), "data": data};

		Properties
			.findByIdAndUpdate(id, historyObj)
			.exec((err, saved) => {
			err ? reject({message: err.message})
				: resolve(saved);
			});
    });
});

agreementsSchema.static('updatePropertyStatus', (id:string, userId:string, until:string, status:string, agreement:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Properties
			.findById(id)
			.exec((err, property) => {
				if (err) {
					reject({message: err.message});
				}
				else if (property) {
					if (property.agreements.data) {
						Agreements.createHistoryProperty(id, "agreement", property.agreements.data);
					}
					if (property.rented.data.by) {
						Agreements.createHistoryProperty(id, "rented", property.rented.data);
					}
					property.status = status;
					property.agreements.data = agreement;
					property.rented.data.by = userId;
					property.rented.data.until = until;
					property.save((err, saved) => {
						err ? reject({message: err.message})
							: resolve(saved);
					});
				}
			})
	});
});

agreementsSchema.static('updateUserRented', (userId:string, until:string, property:string, agreement:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users
			.findByIdAndUpdate(userId, {
				$push: {
					"rented_properties": {
						"until": until,
						"property": property,
						"agreement": agreement
					}
				}
			})
			.exec((err, updated) => {
				err ? reject({message: err.message})
					: resolve(updated);
			})
	});
});

agreementsSchema.static('landlordSign', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) {reject({message: err.message});}
				else if (appointment) {
					if (appointment.agreement) {
						let idAgreement = appointment.agreement;
						Agreements.signTA(idAgreement, data, "landlord");
						resolve(appointment);
					}
					else { reject({message: "Agreement not found"}); }
				}
				else { reject({message: "Appointment not found"}); }
			})
	});
});

agreementsSchema.static('tenantAcceptance', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) {reject({message: err.message});}
				else if (appointment) {
					if (appointment.agreement) {
						let idAgreement = appointment.agreement;
						Agreements.signTA(idAgreement, data, "tenant");
						resolve(appointment);
					}
					else { reject({message: "Agreement not found"}); }
				}
				else { reject({message: "Appointment not found"}); }
			})
	});
});

// agreementsSchema.static('tenantAcceptance', (id:string, data:Object):Promise<any> => {
// 	return new Promise((resolve:Function, reject:Function) => {
// 		Appointments
// 			.findById(id)
// 			.exec((err, appointment) => {
// 				if (err) {reject({message: err.message});}
// 				else {
// 					if (appointment.agreement) {
// 						let idAgreement = appointment.agreement;
// 						Agreements.signTA(idAgreement, data, "tenant");
// 						resolve(appointment);
// 					}
// 				}
// 			})
// 	});
// });

agreementsSchema.static('signTA', (id:string, data:Object, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = data
		let SignObj = {$set: {}};
		SignObj.$set["tenancy_agreement.data.confirmation." + type + ".sign"] = body.signature;
		SignObj.$set["tenancy_agreement.data.confirmation." + type + ".date"] = new Date();
		Agreements
			.findByIdAndUpdate(id, SignObj)
			.exec((err, updated) => {
				err ? reject({message: err.message})
					: resolve(updated);
			})
	});
});

agreementsSchema.static('acceptTA', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let body:any = data;
		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {
				if (err) {
					reject (err);
				}
				else if (agreement) {					
					let propertyId = agreement.property._id.toString();
					let tenantId = agreement.tenant._id;
					let landlordId = agreement.landlord._id;

					if (tenantId != IDUser) {
						resolve({message: "forbidden"})
					}
					else if (tenantId == IDUser) {	
						if (agreement.tenancy_agreement.data.status != 'rejected' || agreement.tenancy_agreement.data.status != 'expired') {
							if (body.sign) {
								agreement.tenancy_agreement.data.status = "admin-confirmation";
								agreement.tenancy_agreement.data.created_at = new Date();
								agreement.save((err, saved)=>{
									if (err) {
										reject({message: err.message});
									}
									else if (saved) {
										let type_notif = "acceptTA";
										let typeEmail = "acceptTa";
										let type = "tenancy_agreement";
										Agreements.email(id, typeEmail);
										Agreements.notification(id, type_notif);
										Agreements.confirmation(id, data, type);
										Agreements.getTotalTANeedApprove();
										resolve({status: "TA "+ saved.tenancy_agreement.data.status});
									}						
								});
							}			
							else {
								reject({mesage: "sign not found"});
							}
						}
						else {
							reject({message: "ta is expired or rejected"});
						}
					}					
				}
			})					
	});
});

agreementsSchema.static('tenantRejectTa', (id:string, userId:string, role:string, ta:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let body:any = ta;
		Appointments
			.findById(id)
			.exec((err, appointment) => {
				if (err) { reject({message: err.message}) }
				else if (appointment) {
					if (appointment.agreement) {
						let idAgreement = appointment.agreement;
						let data = {remarks: body.rejected_reason}
						Agreements.rejectTA(idAgreement.toString(), userId, role, data);
						resolve(appointment);
					}
					else { reject({message: "Agreement not found"}); }
				}
				else { reject({message: "Appointment not found"}); }
			})		
	});
});

agreementsSchema.static('rejectTA', (id:string, userId:string, role:string, ta:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let body:any = ta;

		Agreements
			.findById(id)
			.populate("room landlord tenant property appointment")
			.exec((err, agreement) => {
				if (err) {
					reject({message: err.message});
				}
				else if (agreement) {
					let landlordId = agreement.landlord._id;
					let tenantId = agreement.tenant._id.toString();

					if (tenantId != IDUser) {
						reject({message:"forbidden"});
					}
					else if (tenantId == IDUser || role == "admin") {
						let loi = agreement.letter_of_intent.data;
						let ta = agreement.tenancy_agreement.data;
						let paymentIdLoi = loi.payment;	
						if (loi.status == "accepted" || ta.status == "pending") {
							Agreements.penaltyPayment(paymentIdLoi, body.remarks);		
							Agreements.updatePropertyStatusPayment(agreement.property._id, "published");								
							agreement.tenancy_agreement.data.status = "rejected";
							agreement.letter_of_intent.data.status = "rejected";
							agreement.save((err, saved) => {
								if (err) {
									reject({message: err.message});
								}
								else if (saved) {
									if (landlordId == IDUser) {
										let typeEmail = "rejectTa";
										Agreements.email(id, typeEmail);
									}
									if (role == "admin") {
										let typeEmail = "rejectTaAdmin";
										Agreements.email(id, typeEmail);
									}
									resolve(saved);
								}
							})
						}
						else {
							reject({message: "Loi status not accepted or TA status not pending"});
						}													
					}					
				}
			})
	});
});

agreementsSchema.static('stampCertificateTA', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let body:any = data;
		Agreements
			.update({"_id": id}, {
				$set: {
					"tenancy_agreement.data.stamp_certificate": body.stamp_certificate
				}
			})
			.exec((err, updated) => {
				err ? reject({message: err.message})
					: resolve({message: "uploaded"});
				let typeEmail = "stampCertificateTa";
				let type_notif = "certificateStampDuty";
				Agreements.notification(id, type_notif);
				Agreements.email(id, typeEmail);
			})
	});
});

agreementsSchema.static('memberSectionOwnedTa', (userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let IDUser = userId.toString();
		let _query = { $or: [{"landlord": userId}, {"tenant": userId}]};

		Agreements
			.find(_query)
			.populate("landlord tenant tenancy_agreement.data.stamp_certificate tenancy_agreement.data.payment")
			.populate({
				path: 'property',
	            populate: [{
					path: 'development',
					model: 'Developments'
				},{
					path: 'pictures.living',
					model: 'Attachments'
	            },{
					path: 'pictures.dining',
					model: 'Attachments'
	            },{
					path: 'pictures.bed',
					model: 'Attachments'
	            },{
					path: 'pictures.toilet',
					model: 'Attachments'
	            },{
					path: 'pictures.kitchen',
					model: 'Attachments'
	            },{
					path: 'amenities',
					model: 'Amenities'
	            },{
					path: 'owner.user',
					model: 'Users',
					populate: {
						path: 'picture',
						model: 'Attachments'
					}
				}]
			})	
			.populate({
				path: 'tenancy_agreement.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				}]
			})
			.exec((err, agreements) => {
				if (err) { reject({message: err.message}); }
				else {				
					let landlordUnread = 0;
					let tenantUnread = 0;
					let totalAgreementLandlord = 0;
					let totalAgreementTenant = 0;
					let readBy = [];
					for (var a = 0; a < agreements.length; a++) {
						let agreement = agreements[a];
						if (agreement.tenant) {
							let tenant = agreement.tenant;
							if (tenant._id == userId.toString()){
							totalAgreementTenant = totalAgreementTenant + 1;
							if (agreement.tenant_seen == false) {
								tenantUnread = tenantUnread + 1;
							}
							else if (agreement.tenant_seen == true) {
								readBy.push(tenant._id);
							}
						}                    
					}                  
					let landlord = agreement.landlord;
					if (landlord._id == userId.toString()) {
						totalAgreementLandlord = totalAgreementLandlord + 1;
						if (agreement.landlord_seen == false) {
						landlordUnread = landlordUnread + 1;
						}
						else if (agreement.landlord_seen == true) {
						readBy.push(landlord._id);
						}
					}                  
					}	
					let datas = [];
					for (var i = 0; i < agreements.length; i++) {
						let agreement = agreements[i];
						let property = agreement.property;
						let tenant = agreement.tenant;
						let ta = agreement.tenancy_agreement.data;
						let unread = tenantUnread;
						let read = ta.tenant_seen;
						let totalTa = totalAgreementTenant;
						let appointment = "";
						let asLandlord = false;
						if (agreement.appointment) {
							appointment = agreement.appointment;
						}
						if (agreement.landlord._id == IDUser) {
							asLandlord = true;
							unread = landlordUnread;
							let read = ta.landlord_seen;
							let totalTa = totalAgreementLandlord;
						}
						let unit = "";
						let unit2 = "";
						let blokNo = "";
						let streetName = "";
						let postalCode = "";
						let coordinates = [];
						let country = "";
						let fullAddress = "";
						let typeAddress = "";
						let pictureLiving = [];
						let pictureDining = [];
						let pictureBed = [];
						let pictureToilet = [];
						let pictureKitchen = [];
						let favorite = false;
						let amenities = [];
						let detailsSize = 0;
						let detailsSizeSqm = 0;
						let detailsBedroom = 0;
						let detailsBathrom = 0;
						let detailsPrice = 0;
						let detailsPsqft = 0;
						let detailsAvailable = "";
						let detailsFurnishing = "";
						let detailsDescription = "";
						let detailsType = "";
						let idProperty = "";
						let propertyDevelopmentName = "";
						let propertyOwnerId = "";
						let propertyOwnerUsername = "";
						let propertyOwnerPicture = "";
						if (agreement.property) {
							let property = agreement.property;
							if (property.owner.user){
								propertyOwnerId = property.owner.user._id;
								propertyOwnerUsername = property.owner.user.username;
								if (property.owner.user.picture) {
									propertyOwnerPicture = property.owner.user.picture.url;
								}
							}
							idProperty = property._id;
							propertyDevelopmentName = property.development.name;
							unit = property.address.floor;
							unit2 = property.address.unit;
							blokNo = property.address.block_number;
							streetName = property.address.street_name;
							postalCode = property.address.postal_code;
							coordinates = [Number(property.address.coordinates[0]) , Number(property.address.coordinates[1])];
							country = property.address.country;
							fullAddress = property.address.full_address;
							typeAddress = property.address.type;
							if (property.amenities) {
								for (var k = 0; k < property.amenities.length; k++) {
									let data = {
										_id: property.amenities[k]._id,
										name: property.amenities[k].name
									}
									amenities.push(data);
								}
							}
							if (property.pictures.living){
								for (var a = 0; a < property.pictures.living.length; a++) {
									let data = property.pictures.living[a].url
									pictureLiving.push(data);
								}
							}
							if (property.pictures.dining){
								for (var b = 0; b < property.pictures.dining.length; b++) {
									let data = property.pictures.dining[b].url
									pictureDining.push(data);
								}
							}
							if (property.pictures.bed){
								for (var c = 0; c < property.pictures.bed.length; c++) {
									let data = property.pictures.bed[c].url
									pictureBed.push(data);
								}
							}
							if (property.pictures.kitchen){
								for (var d = 0; d < property.pictures.kitchen.length; d++) {
									let data = property.pictures.kitchen[d].url
									pictureKitchen.push(data);
								}
							}
							if (property.pictures.toilet){
								for (var e = 0; e < property.pictures.toilet.length; e++) {
									let data = property.pictures.toilet[e].url
									pictureToilet.push(data);
								}
							}	
							detailsSize = property.details.size_sqf;	
							detailsSizeSqm = property.details.size_sqm;
							detailsBedroom = property.details.bedroom;
							detailsBathrom = property.details.bathroom;				
							detailsPrice = property.details.price;
							detailsPsqft = property.details.psqft;
							detailsAvailable = property.details.available;
							detailsFurnishing = property.details.furnishing;
							detailsDescription = property.details.description;
							detailsType = property.details.type;
						}
						let landlordName = "";
						let landlordId = "";
						let landlordIdNo = "";
						let landlordUsername = "";
						let landlordPicture = "";
						if (agreement.landlord) {
							let landlord = agreement.landlord;
							landlordName = landlord.landlord.data.name;
							landlordIdNo = landlord.landlord.data.identification_number;
							landlordId = landlord._id;
							landlordUsername = landlord.username;
							if (landlord.picture) {
								landlordPicture = landlord.picture.url;
							}
						}
						let tenantName = "";
						let tenantType = "";
						let tenantIdNo = "";
						let tenantIdentityFront = "";
						let tenantidentityBack = "";
						let tenantId = "";
						let tenantUsername = "";
						let tenantPicture = "";
						if (agreement.tenant) {
							let tenant = agreement.tenant;
							tenantName = tenant.tenant.data.name;
							tenantType = tenant.tenant.data.identification_type;
							tenantIdNo = tenant.tenant.data.identification_number;
							tenantId = tenant._id;
							tenantIdentityFront = tenant.tenant.data.identification_proof.front;
							if (tenant.tenant.data.identification_proof.back && tenant.tenant.data.identification_proof.back != null) {
								tenantidentityBack = tenant.tenant.data.identification_proof.back;
							}							
							tenantUsername = tenant.username;
							if (tenant.picture) {
								tenantPicture = tenant.picture.url;
							}
						}
						let stampCertificateStatus = false;
						let stampCertificateUrl = "";
						if (ta.stamp_certificate) {
							stampCertificateStatus = true;
							stampCertificateUrl = ta.stamp_certificate.url;
						}
						let send = false;
						if (ta.status) {
							send = true;
						}
						let paymentStatus = 'waiting';
						if (ta.payment) {
							if (ta.payment.status == 'accepted' || ta.payment.status == 'rejected') {
								paymentStatus = ta.payment.status;
							}
						}
						let seenCount = 0;
						if (ta.seen_count) {
							seenCount = ta.seen_count;
						}
						let data = {							
							"_id": agreement._id,
							"appointment_id": appointment,
							"as_landlord": asLandlord,
							"property": {
								"_id": idProperty,
								"development": propertyDevelopmentName,
								"user": {
									"_id": propertyOwnerId,
									"username": propertyOwnerUsername,
									"pictures": propertyOwnerPicture
								},
								"address": {
									"unit_no": unit,
									"unit_no_2": unit2,
									"block_no": blokNo,
									"street_name": streetName,
									"postal_code": postalCode,
									"coordinates": coordinates,
									"country": country,
									"full_address": fullAddress,
									"type": typeAddress
								},
								"pictures": {
									"living": pictureLiving,
									"dining": pictureDining,
									"bed": pictureBed,
									"toilet": pictureToilet,
									"kitchen": pictureKitchen
								},
								"favourite": favorite,
								"amenities": amenities,
								"details": {
									"size": detailsSize,
									"size_sqm": detailsSizeSqm,
									"bedroom": detailsBedroom,
									"bathroom": detailsBathrom,
									"price": detailsPrice,
									"psqft": detailsPsqft,
									"available": detailsAvailable,
									"furnishing": detailsFurnishing,
									"description": detailsDescription,
									"type": detailsType
								},
								"seen": {
									"by": readBy,
									"counts": seenCount
								}
							},
							"landlord": {
								"full_name": landlordName,
								"id_number": landlordIdNo,
								"_id": landlordId,
								"username": landlordUsername,
								"profile_picture": landlordPicture
							},
							"tenant": {
								"name": tenantName,
								"type": tenantType,
								"id_no": tenantIdNo,
								"identity_front": tenantIdentityFront,
								"identity_back": tenantidentityBack,
								"_id": tenantId,
								"username": tenantUsername,
								"profile_picture": tenantPicture
							},
							"status": ta.status,
							"stamp_certificate": {
								"uploaded": stampCertificateStatus,
								"url": stampCertificateUrl
							},
							"send": send,
							"created_at": ta.created_at,
							"payment_details": {
								"status": "waiting"
							},
							"seen_by": readBy,
							"read": read,
							"unread": unread,
							"total": totalTa
						}
						datas.push(data);
					}
					resolve(datas);
				}
			})
	});
});

agreementsSchema.static('memberSectionTaById', (id:string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let IdUser = userId.toString();
		Agreements
			.findById(id)
			.populate("payment")
			.populate ({
				path: 'landlord',
				populate: [{
					path: 'landlord.data.identification_proof.front',
					model: 'Attachments'
				},{
					path: 'landlord.data.identification_proof.back',
					model: 'Attachments'
				}]
			})
			.populate ({
				path: 'tenant',
				populate: [{
					path: 'tenant.data.identification_proof.front',
					model: 'Attachments'
				},{
					path: 'tenant.data.identification_proof.back',
					model: 'Attachments'
				}]
			})
			.populate ({
				path: 'tenancy_agreement.data.payment',
				populate: {
					path: 'attachment.payment',
					model: 'Attachments'
				}
			})
			
			.exec((err, agreement) => {
				if (err) { reject({message: err.message}); }
				else if (agreement) {
					let ta = agreement.tenancy_agreement.data;
					let asLandlord = false;
					if (agreement.landlord._id == IdUser){
						asLandlord = true;
					}
					let tenantSignStatus = false;
					let tenantSign = "";
					let tenantSignDate = "";
					if (agreement.tenancy_agreement.data.confirmation.tenant) {
						tenantSignStatus = true;
						tenantSign = agreement.tenancy_agreement.data.confirmation.tenant.sign;
						tenantSignDate = agreement.tenancy_agreement.data.confirmation.tenant.date;
					}
					let landlordSignStatus = false;
					let landlordSign = "";
					let landlordSignDate = "";
					if (agreement.tenancy_agreement.data.confirmation.landlord) {
						landlordSignStatus = true;
						landlordSign = agreement.tenancy_agreement.data.confirmation.tenant.sign;
						landlordSignDate = agreement.tenancy_agreement.data.confirmation.tenant.date;
					}
					let landlordName = "";
					let landlordId = "";
					let landlordIdNo = "";
					let landlordIdType = "";
					let landlordUsername = "";
					let landlordIdFront = "";
					let landlordIdBack = "";
					if (agreement.landlord) {
						let landlord = agreement.landlord;
						landlordName = landlord.landlord.data.name;
						landlordIdNo = landlord.landlord.data.identification_number;
						landlordId = landlord._id;
						landlordIdType = landlord.landlord.data.identification_type;
						landlordUsername = landlord.username;
						if (landlord.landlord.data.identification_proof.front) {
							landlordIdFront = landlord.landlord.data.identification_proof.front.url;
						}
						if (landlord.landlord.data.identification_proof.back) {
							landlordIdBack = landlord.landlord.data.identification_proof.back.url;
						}
					}
					let tenantName = "";
					let tenantId = "";
					let tenantIdNo = "";
					let tenantIdType = "";
					let tenantUsername = "";
					let tenantIdFront = "";
					let tenantIdBack = "";
					if (agreement.landlord) {
						let tenant = agreement.tenant;
						tenantName = tenant.tenant.data.name;
						tenantIdNo = tenant.tenant.data.identification_number;
						tenantId = tenant._id;
						tenantIdType = tenant.tenant.data.identification_type;
						tenantUsername = tenant.username;
						if (tenant.tenant.data.identification_proof.front) {
							tenantIdFront = tenant.tenant.data.identification_proof.front.url;
						}
						if (tenant.tenant.data.identification_proof.back) {
							tenantIdBack = tenant.tenant.data.identification_proof.back.url;
						}
					}
					let stampCertificateStatus = false;
					let stampCertificateUrl = "";
					if (ta.stamp_certificate) {
						stampCertificateStatus = true;
						stampCertificateUrl = ta.stamp_certificate.url;
					}
					let scd = 0;
					let paymentApproved = false;
					let statusPayment = "";
					let paymentProof = "";

					if (agreement.tenancy_agreement.data.payment.fee) {
						let fees = agreement.tenancy_agreement.data.payment.fee;
						for (var a = 0; a < fees.length; a++) {
							let fee = fees[a];
							if (fee.code_name == "scd") {
								scd = fee.amount;
							}
							if (fee.received_amount > 0) {
								paymentApproved = true;
							}							
						}
						statusPayment = agreement.tenancy_agreement.data.payment.status;
						paymentProof = agreement.tenancy_agreement.data.payment.attachment.payment.url;
					}
					let data = {
						"as_landlord": asLandlord,
						"created_at": agreement.tenancy_agreement.data.created_at,
						"status": agreement.tenancy_agreement.data.status,
						"landlord_acceptance": {
							"signed": tenantSignStatus,
							"sign": tenantSign, // only if signed true
							"sign_date": tenantSignDate // only if signed true
						},
						"tenant_acceptance": {
							"signed": landlordSignStatus,
							"sign": landlordSign, // only if signed true
							"sign_date": landlordSignDate // only if signed true
						},
						"landlord_details": {
							"name": landlordName,
							"id_no": landlordIdNo,
							"id_type": landlordIdType,
							"identity_front": landlordIdFront,
							"identity_back": landlordIdBack
						},
						"tenant_details": {
							"name": tenantName,
							"id_no": tenantIdNo,
							"id_type": tenantIdType,
							"identity_front": tenantIdFront,
							"identity_back": tenantIdBack
						},
						"payment_details": {
							"security_deposit": scd,
							"second_payment_approved": paymentApproved,
							"status" :  statusPayment,
							"second_payment_proof": paymentProof
						},
						"stamp_certificate": {
							"uploaded": stampCertificateStatus,
							"url": stampCertificateUrl//defined only if uploaded true
						},
						"doc": ""
					}
					resolve(data);
				}
				else { reject({message: "Agreement not found"});}
			})
	});
});

//inventory list
agreementsSchema.static('getAllInventoryList', (userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let IDUser = userId.toString();
		let _query = { $or: [{"landlord": userId}, {"tenant": userId}]};
		Agreements
			.find(_query)
			.populate("landlord tenant")
			.populate({
				path: 'property',
	            populate: [{
					path: 'development',
					model: 'Developments'
				},{
					path: 'pictures.living',
					model: 'Attachments'
	            },{
					path: 'pictures.dining',
					model: 'Attachments'
	            },{
					path: 'pictures.bed',
					model: 'Attachments'
	            },{
					path: 'pictures.toilet',
					model: 'Attachments'
	            },{
					path: 'pictures.kitchen',
					model: 'Attachments'
	            }]
			})
			.exec((err, il) => {
				if (err) {
					reject({message: err.message});
				}
				if (il) {
					let datas = [];
					for(var i = 0; i < il.length; i++) {
						let ilArr = il[i];
						let history = false;
						if(ilArr.inventory_list.histories.length > 0){
							for (var j = 0; j < ilArr.inventory_list.histories.length; j++) {
								if (ilArr.inventory_list.histories[j].delete == false) {
									history = true;
								}
							}
						}
						if (ilArr.inventory_list.data) {
							if (ilArr.inventory_list.data.status) {
								let data = {
									"_idAgreement": ilArr._id,
									"landlord": ilArr.landlord,
									"tenant": ilArr.tenant,
									"property": ilArr.property,
									"history": history,
									"inventory_list": ilArr.inventory_list.data
								}
								datas.push(data);
							}							
						}
					}
					resolve(datas);
				}
			})		
	});
});

agreementsSchema.static('getInventoryListHistories', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let IDUser = userId.toString();
		let _query;
		if (role == "admin") {
			_query = {"_id": id};
		}
		else {
			_query = {$and: [{ $or: [{"landlord": userId}, {"tenant": userId}] }, {"_id": id}]}
		}		
		Agreements
			.findOne(_query)
			.populate("landlord tenant tenancy_agreement.data.stamp_certificate")
			.populate({
				path: 'property',
	            populate: [{
					path: 'development',
					model: 'Developments'
				},{
					path: 'pictures.living',
					model: 'Attachments'
	            },{
					path: 'pictures.dining',
					model: 'Attachments'
	            },{
					path: 'pictures.bed',
					model: 'Attachments'
	            },{
					path: 'pictures.toilet',
					model: 'Attachments'
	            },{
					path: 'pictures.kitchen',
					model: 'Attachments'
	            }]
			})
			.populate({
				path: 'tenancy_agreement.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				}]
			})
			.exec((err, il) => {
				if (err) {
					reject({message: err.message});
				}
				else if (il) {
					let datas = [];			
					if (il.inventory_list){
						if (il.inventory_list.histories.length > 0) {
							let histories = il.inventory_list.histories;							
							for(var j = 0; j < histories.length; j++) {
								let history = histories[j];
								if (history.delete == false) {
									let data = {
										"_idAgreement": il._id,
										"landlord": il.landlord,
										"tenant": il.tenant,
										"property": il.property,
										"_idHistories": history._id,
										"delete": history.delete,
										"history_date": history.date,
										"inventory_list": history.data
									}
									datas.push(data);								
								}								
							}								
						}
					}
					resolve(datas);
				}				
				else {
					reject({message: "no data exists in your account"});
				}
			})		
	});
});

agreementsSchema.static('getInventoryList', (id:string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Agreements
			.findById(id)
			.select("inventory_list.data")
			.populate("inventory_list.data.lists.items.attachments")
			.exec((err, agreements) => {
				err ? reject({message: err.message})
					: resolve(agreements.inventory_list.data);
			});
	});
});

agreementsSchema.static('getInventoryList', (id:string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Agreements
			.findById(id)
			.select("inventory_list.data")
			.populate("inventory_list.data.lists.items.attachments")
			.exec((err, agreements) => {
				err ? reject({message: err.message})
					: resolve(agreements.inventory_list.data);
			});
	});
});

agreementsSchema.static('createInventoryList', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let body:any = data;
		let type_notif = "initiateIL";
		let IDUser = userId.toString();

		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {
				if (err) {
					reject({message: err.message});
				}
				else if (agreement) {
					let landlordId = agreement.landlord._id;
					let tenantId = agreement.tenant._id;
					let propertyId = agreement.property._id;
					let il = agreement.inventory_list.data;

					if (landlordId != IDUser) {
						reject ({message: "sorry you can not create this Inventory List"});
					}
					else if (landlordId == IDUser) {
						if (il.status == "pending") {
							let typeDataa = "inventory_list";
							Agreements.createHistory(id, typeDataa).then(res => {
								agreement.inventory_list.data.lists = body.lists;
								agreement.inventory_list.data.created_at = new Date();	
								agreement.save((err, saved) => {
									if (err) {
										reject({message: err.message});
									}
									if (saved) {
										let type = "updateInventory";
										Agreements.email(id, type);
										resolve({message: 'update inventory list success'});
									}
								});								
							});							
						}
						if (il.status == "completed") {
							resolve({message: "can not change"})
						}
						if (!il.status) {
							if (body.sign) {
								agreement.inventory_list.data.confirmation.landlord.sign = body.sign;
								agreement.inventory_list.data.confirmation.landlord.date = new Date();
								agreement.inventory_list.data.status = "pending";
								agreement.inventory_list.data.created_at = new Date();
								agreement.inventory_list.data.property = propertyId;
								agreement.inventory_list.data.lists = body.lists;
								agreement.save((err, saved) => {
									if (err) {
										reject({message: err.message});
									}
									else if (saved) {
										Agreements.notification(id, type_notif);
										let type = "createInventory";
										Agreements.email(id, type);
										resolve({message: 'create inventory list success'});
									}
								})
							}
							else {
								reject({message: "sign not found"});
							}
						}
					}
				}
			})		
	});
});

agreementsSchema.static('tenantCheckInventoryList', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let body:any = data;
		let ObjectID = mongoose.Types.ObjectId;
		let type_notif = "confirmedIL";
		let IDUser = userId.toString();
		
		Agreements
			.findById(id, (err, agreement) => {
				let tenantId = agreement.tenant;

				if (tenantId != IDUser) {
					reject ({message: "sorry you can not check this Inventory List"})
				}
				else if (tenantId == IDUser) {
					if (body.sign) {
						for(var i = 0; i < body.lists.length; i++) {
							for(var j = 0; j < agreement.inventory_list.data.lists.length; j++) {
								if (agreement.inventory_list.data.lists[j]._id == body.lists[i].idList) {
									for(var k = 0; k < body.lists[i].idItems.length; k++) {
										for(var l = 0; l < agreement.inventory_list.data.lists[j].items.length; l++) {
											if (body.lists[i].idItems[k] == agreement.inventory_list.data.lists[j].items[l]._id) {
												agreement.inventory_list.data.lists[j].items[l].tenant_check = "true";
												agreement.save((err, result) => {
													if (err) {
														reject({message: err.message});
													}
												});	
											}
										}
									}
								}
							}
						}
						agreement.inventory_list.data.confirmation.tenant.sign = body.sign;
						agreement.inventory_list.data.confirmation.tenant.date = new Date();
						agreement.inventory_list.data.status = "completed";
						agreement.save((err, update) => {
							if (err) {
								reject({message: err.message});
							}
							else if (update) {
								Agreements.notification(id, type_notif).then(res => {
									let typeEmail = "confirmInventory";
									Agreements.email(id, typeEmail);
									resolve({message: 'success'});
								});		
							}
						});
					}
					else {
						reject({message: "sign not found"});
					}					
				}							
			})
	});
});

agreementsSchema.static('removeLOI', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
		Agreements.createHistory(id, 'letter_of_intent').then(res => {
			resolve({
				message: 'success',
				code: 200,
				data: 1
			});
		})
	});
});

agreementsSchema.static('removeTA', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
		Agreements.createHistory(id, 'tenancy_agreement').then(res => {
			resolve({
				message: 'success',
				code: 200,
				data: 1
			});
		})
	});
});

//create History
agreementsSchema.static('createHistory', (id:string, typeDataa:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
    	let data = "";
        Agreements
          .findById(id, typeDataa, (err, result) => {
          	if (typeDataa == "letter_of_intent") {
            	data = result.letter_of_intent.data;
            }
            if (typeDataa == "tenancy_agreement") {
            	data = result.tenancy_agreement.data;
            }
            if (typeDataa == "inventory_list") {
            	data = result.inventory_list.data;
            }
            
            var historyObj = {$push: {}};  
            historyObj.$push[typeDataa+'.histories'] = {"date": new Date(), "data": data};
			// historyObj.$unset[typeDataa+'.data'] = "";

            Agreements
              .findByIdAndUpdate(id, historyObj)
              .exec((err, saved) => {
                err ? reject({message: err.message})
                	: resolve(saved);
              });
          })
    });
});

//delete History
agreementsSchema.static('deleteHistory', (idAgreement:string, idHistory:string, typeDataa:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {            
		var historyObj = {$set: {}};  
		let _query;
		historyObj.$set[typeDataa+'.histories.$.delete'] = true;
		if (typeDataa == "letter_of_intent") {
			_query = {"_id": idAgreement, "letter_of_intent.histories": {$elemMatch: {"_id": idHistory}}};
		}
		if (typeDataa == "tenancy_agreement") {
			_query = {"_id": idAgreement, "tenancy_agreement.histories": {$elemMatch: {"_id": idHistory}}};
		}
		if (typeDataa == "inventory_list") {
			_query = {"_id": idAgreement, "inventory_list.histories": {$elemMatch: {"_id": idHistory}}};
		}
		Agreements
			.update(_query, historyObj)
			.exec((err, saved) => {
			err ? reject({message: err.message})
				: resolve(saved);
			});
    });
});

//confirmation
agreementsSchema.static('confirmation', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}				
		let body:any = data;
		let sign = body.sign;
		let type = body.type; //type ('letter_of_intent', 'tenancy_agreement', 'inventory_list')
		let status = body.status; //status ('tenant', 'landlord')
		let confirmObj = {$set: {}};
		confirmObj.$set[type + ".data.confirmation." + status + ".sign"] = body.sign;
		confirmObj.$set[type + ".data.confirmation." + status + ".date"] = new Date;
		Agreements
			.findByIdAndUpdate(id, confirmObj)
			.exec((err, saved) => {
                err ? reject({message: err.message})
                	: resolve(saved);
            });
	});
});

agreementsSchema.static('loiPayment', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements.findById(id).exec((err, agreement) => {
			if (err) {
				reject({message: err.message});
			}
			else if (agreement) {
				let loiData = agreement.letter_of_intent.data;
				let gfd = loiData.gfd_amount;
				let std = loiData.sd_amount;

				if (loiData.payment) {
					resolve({message: "Already Payment"});									
				}
				if (!loiData.payment) {
					resolve({
						staysmart_bank : {
							account_name: "Staysmart Pte. Ltd.",
							bank_name: "DBS",
							account_number: "100-904130-7"
						},
						gfd_amount: gfd,
						sd_amount: std,
						total_amount: gfd + std
					});
				}
			}
		});
	});
});

agreementsSchema.static('taPayment', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements.findById(id).exec((err, agreement) => {
			if (err) {
				reject({message: err.message});
			}
			else if (agreement) {
				let loiData = agreement.letter_of_intent.data;
				let taData = agreement.tenancy_agreement.data;
				let scd = loiData.security_deposit;

				if (taData.payment) {
					resolve({message: "Already Payment"});
				}
				if (!taData.payment) {
					resolve({
						staysmart_bank : {
							account_name: "Staysmart Pte. Ltd.",
							bank_name: "DBS",
							account_number: "100-904130-7"
						},
						security_deposit: scd,
						total_amount: scd
					});
				}
			}
		});
	});
});

//payment
agreementsSchema.static('payment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = data;
		let type = body.type; //type ('letter_of_intent', 'tenancy_agreement')
		let paymentFee = [];
		let paymentType = "";
		let payObj = {$set: {}};
		console.log(body);

		Agreements
			.findById(id)
			.exec((err, agreement) => {
				if (err) {
					reject({message: err.message});
				}
				else if (agreement) {
					let loiData = agreement.letter_of_intent.data;
					let taData = agreement.tenancy_agreement.data;
					let gfd = loiData.gfd_amount;
					let std = loiData.sd_amount;
					let scd = loiData.security_deposit;							
					if (type == "letter_of_intent") {
						if (loiData.payment) {
							resolve({message: "Already Payment"});									
						}
						if (!loiData.payment) {
								paymentFee = [{
								"code_name": "std",
								"name": "Stamp Duty",
								"amount": std
							},
							{
								"code_name": "gfd",
								"name": "Good Faith Deposit",
								"amount": gfd
							}];
							paymentType = "loi";
						}
					}
					if (type ==  "tenancy_agreement") {
						if (taData.payment) {
							resolve({message: "Already Payment"});
						}
						if (!taData.payment) {
							paymentFee = [{
								"code_name": "scd",
								"name": "Security Deposit",
								"amount": scd
							}];
							paymentType = "ta";
						}
					}
					var _payment = new Payments();
					_payment.fee = paymentFee;
					_payment.type = paymentType;
					_payment.attachment.payment = body.attachment;
					_payment.status = "pending";
					_payment.created_at = new Date();
					_payment.save((err, saved)=>{
						if (err) {
							reject({message: err.message});
						}
						else if (saved) {
							var paymentId = saved._id;
							if (type ==  "tenancy_agreement") {
								agreement.tenancy_agreement.data.payment = paymentId;
							}
							if (type == "letter_of_intent") {
								agreement.letter_of_intent.data.payment = paymentId;
							}
							agreement.save((err, saved) => {
								err ? reject({message: err.message})
					      			: resolve({payment_id: paymentId, message:"payment created"});
					      		})
						}
					})											
				}
			})	
	});
});

agreementsSchema.static('addRefund', (id:string, refundPayment:number):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Payments
			.update({"_id":id}, {
				$push: {
					"fee":{
						"code_name": "mmr",
						"name": "refund",
						"created_at": new Date(),
						"received_amount": refundPayment,
						"needed_refund": true,
						"refunded": false
					}
				}
			})
			.exec((err, updated) => {
	      		err ? reject({message: err.message})
	      			: resolve(updated);
	      	});
	});
});

agreementsSchema.static('paymentCekStatus', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Payments
			.findById(id)
			.exec((err, res) => {
				if (err) {
					reject({message: err.message})
				}
				else if (res) {
					if (res.status == "accepted") {
						resolve({message: "Allready Accept this Payment"});
					}
					else if (res.status == "rejected" || res.status == "pending") {
						resolve(res);
					}	
					else {
						resolve({message: "No Data Payment"});
					}				
				}
			})
	});
});

agreementsSchema.static('updatePropertyStatusPayment', (id:string, status:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Properties
			.update({"_id": id}, {
				$set: {
					"status": status
				}
			})
			.exec((err, updated) => {
			err ? reject({message: err.message})
				: resolve(updated);
			})
	});
});

agreementsSchema.static('paymentReceiveAmount', (idAgreement:string, id:string, code:string, receiveAmount:number, neededRefund:boolean, payment_confirm:string, status:string, remarks:string, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Agreements
			.findById(idAgreement)
			.exec((err, agreement) => {
				if (err) { reject({message: err.message}); }
				else if (agreement) {
					let data;
					if (type == "loi") {
						if (status == 'accepted') {
							Agreements.updatePropertyStatusPayment(agreement.property, "initiated");
						}
						else {
							Agreements.updatePropertyStatusPayment(agreement.property, "published");
						}
						let statusLOI = agreement.letter_of_intent.data.status;
						if (statusLOI == "rejected" || statusLOI == "expired") {
							data = { $set: { "fee.$.received_amount": receiveAmount, "fee.$.refunded": false, "fee.$.updated_at": new Date(), "attachment.payment_confirm": payment_confirm, "remarks": remarks, "status": status, "received_at": new Date() }};
						}
						else {
							data = { $set: { "fee.$.received_amount": receiveAmount, "fee.$.needed_refund": neededRefund, "fee.$.refunded": false, "fee.$.updated_at": new Date(), "attachment.payment_confirm": payment_confirm, "status": status, "remarks": remarks, "received_at": new Date() }};
						}
					}
					else if (type == "ta") {						
						data = { $set: { "fee.$.received_amount": receiveAmount, "fee.$.needed_refund": neededRefund, "fee.$.refunded": false, "fee.$.updated_at": new Date(), "attachment.payment_confirm": payment_confirm, "status": status, "remarks": remarks, "received_at": new Date() }};
					}
					Payments
						.update({"_id": id, "fee": {$elemMatch: {"code_name": code}}}, data)
						.exec((err, updated) => {
							err ? reject({message: err.message})
								: resolve(updated);
						});
				}
				else {
					reject({message: "Agreement not found"})
				}
			})		
	});
});

agreementsSchema.static('updateReceivePayment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		var ObjectID = mongoose.Types.ObjectId;	
		var body:any = data;
		console.log(data);
		let idPayment = body.paymentID.toString();
		let neededRefundGfd;
		let neededRefundStd;
		let neededRefundScd;

		if (body.typeInput == "loi") {
			if (body.status == "accepted") {
				neededRefundGfd = false;
				neededRefundStd = false;
			}
			else {
				neededRefundGfd = true;
				neededRefundStd = true;
			}
			
		}
		if (body.typeInput == "ta") {
			if (body.status == "accepted") {
				neededRefundGfd = false;
				neededRefundStd = false;
				neededRefundScd = false;
			}
			else {
				neededRefundGfd = false;
				neededRefundStd = true;
				neededRefundScd = true;
			}			
		}
		//stamp duty payment
		if (body.receiveAmountStd) {
			Agreements.paymentReceiveAmount(id, idPayment, "std", body.receiveAmountStd, neededRefundStd, body.payment_confirm, body.status, body.remarks, body.typeInput);
		}
		
		//gfd payment
		if (body.receiveAmountGfd) {
			Agreements.paymentReceiveAmount(id, idPayment, "gfd", body.receiveAmountGfd, neededRefundGfd, body.payment_confirm, body.status, body.remarks, body.typeInput);
		}
		
		//security deposit payment
		if (body.receiveAmountScd) {
			Agreements.paymentReceiveAmount(id, idPayment, "scd", body.receiveAmountScd, neededRefundScd, body.payment_confirm, body.status, body.remarks, body.typeInput);
		}
		
		//refund payment
		if (body.refundPayment) {
			Agreements.addRefund(idPayment, body.refundPayment);
		}		    	
	});
});

agreementsSchema.static('paymentProcess', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		var ObjectID = mongoose.Types.ObjectId;
		let body:any = data;
		let type:any = body.type;
		let receivePayment = body.receive_payment;
		let type_notif = body.type_notif;
		let typeMail = body.type_mail;	
		Agreements
			.findById(id)
			.exec((err, agreement) => {
				if (err) {
					reject({message: err.message})
				}
				else if (agreement) {
					let loiData = agreement.letter_of_intent.data;
					let taData = agreement.tenancy_agreement.data;
					let landlordId = agreement.landlord;
					let tenantId = agreement.tenant;
					let propertyId = agreement.property;
					let paymentLoiID = loiData.payment.toString();
					let paymentTaID;
					if (taData.payment) {
						paymentTaID = taData.payment.toString();
					}					 
					let gfd = loiData.gfd_amount;
					let std = loiData.sd_amount;
					let scd = loiData.security_deposit;
					let termLeaseExtend
					if (loiData.term_lease_extend) {
						termLeaseExtend = loiData.term_lease_extend;
					}
					else if (!loiData.term_lease_extend) {
						termLeaseExtend = 0;
					}
					let dateCommencement = loiData.date_commencement;
					let termLease = loiData.term_lease;
					let longTerm = termLease + termLeaseExtend;
					let dateUntil = dateCommencement.setMonth(dateCommencement.getMonth() + longTerm);
					let until = new Date(dateUntil);
					let receiveGfd;
					let receiveStd;
					let receiveScd;
					let refund;
					let temp;
					if (type == "letter_of_intent") {
						if (loiData.status == "draft" || loiData.status == "expired") {
							resolve({message: "LOI status is draft"})
						}
						else {
							if (loiData.status == "pending") {
								agreement.letter_of_intent.data.status = body.status_loi;
							}
							Agreements.paymentCekStatus(paymentLoiID).then((res) => {
								if (res.message) {
									reject(res);
								}
								else {
									let totalFee = std + gfd;
									if (gfd <= std) {
										receiveGfd = gfd;
										temp = receivePayment - receiveGfd;
										if (temp - std > 0) {
											receiveStd = std;
											refund = temp - std;
										}
										if (temp - std <= 0) {
											receiveStd = temp;
										}
									}
									else {
										receiveStd = std;
										temp = receivePayment - receiveStd;
										if (temp - gfd > 0) {
											receiveGfd = gfd;
											refund = temp - gfd;
										}
										if (temp - gfd <= 0) {
											receiveGfd = temp;
										}
									}
									// if (body.status_payment == "rejected") {
									// 	receiveGfd = 0;
									// 	receiveStd = 0;
									// }
									var data = {
										"paymentID": paymentLoiID,								
										"receiveAmountStd": receiveStd,
										"receiveAmountGfd": receiveGfd,
										"payment_confirm": body.payment_confirm,
										"refundPayment": refund,
										"typeInput": "loi",
										"status": body.status_payment,
										"remarks": body.remarks
									};						

									if (body.status_payment == "accepted") {
										if (receivePayment >= totalFee) {
											Agreements.updateReceivePayment(id, data);
											Agreements.notification(id, type_notif);										
											Agreements.email(id, typeMail);
										}
										else {
											resolve({message: "cannot process this payment, because your payment less than payment LOI"})
										}
									}
									if (body.status_payment == "rejected") {
										Agreements.updateReceivePayment(id, data);
										Agreements.notification(id, type_notif);	
										Agreements.notification(id, "rejectLoi");
										Agreements.notification(id, "rejectLoiLandlord");									
										Agreements.email(id, typeMail);
									}																		
								}
							})
							.catch((err) => {
								reject({message: err.message});
							})
						}						
					}
					if (type == "tenancy_agreement") {
						if (taData.status == "draft" || taData.status == "expired") {
							resolve({message: "TA status is draft or expired"})
						}
						else {
							if (taData.status == "admin-confirmation") {
								agreement.tenancy_agreement.data.status = body.status_ta;
								agreement.letter_of_intent.data.status = body.status_ta;
							}							
							Agreements.paymentCekStatus(paymentTaID).then((res) => {
								if (res.message) {
									resolve(res);
								}
								else {
									let totalFee = scd;
									if (scd > 0) {										
										if (receivePayment < scd) {
											receiveScd = receivePayment;
										}
										else {
											receiveScd = scd;
											temp = receivePayment - scd;
											if (temp > 0) {
												refund = temp;
											}
										}										
									}
									var data ={
										"paymentID": paymentTaID,
										"receiveAmountScd": receiveScd,
										"payment_confirm": body.payment_confirm,
										"refundPayment": refund,
										"typeInput": "ta",
										"status": body.status_payment,
										"remarks": body.remarks
									}	

									if (body.status_payment == "accepted") {
										if (receivePayment >= totalFee) {
											Agreements.updatePropertyStatus(propertyId, tenantId, until, "rented", id.toString());
											Agreements.changeStatusChat(agreement.room.toString(), "rented");
											Agreements.updateUserRented(tenantId, until, propertyId, id.toString());	
											Agreements.updateReceivePayment(id, data);
											Agreements.notification(id, type_notif);										
											Agreements.email(id, typeMail);
										}
										else {
											resolve({message: "cannot process this payment, because your payment less than payment TA"})
										}
									}
									if (body.status_payment == "rejected") {
										Agreements.penaltyPaymentAdminReject(paymentTaID, body.remarks, receiveScd);
										Agreements.penaltyPaymentAdminReject(paymentLoiID, body.remarks, receiveScd);
										Agreements.updateReceivePayment(id, data);
										Agreements.notification(id, type_notif);										
										Agreements.email(id, typeMail);
									}
								}
							})
						}
					}
					agreement.save((err, saved) => {
			      		err ? reject({message: err.message})
			      			: resolve(saved);
			      	});	
				}
			})		
	});
});


agreementsSchema.static('acceptPayment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		

		let ObjectID = mongoose.Types.ObjectId;
		let body:any = data;
		let type:any = body.type;
		let receive_payment = body.receive_payment;
		let type_notif;
		let typeMail;
		let statusTa;
		let statusLoi;
		if (type == "letter_of_intent") {
			typeMail = "acceptLoiPayment";
			statusLoi = "payment-confirmed";
			type_notif = "paymentLOIAccepted";
		}
		if (type == "tenancy_agreement") {
			typeMail = "acceptTaPayment";
			type_notif = "paymentTAAccepted";
			statusTa = "accepted";
			Agreements.getTotalStampCertificateNotUploaded();
		}

		let dataAccept = {
			"type": type,
			"receive_payment": receive_payment,
			"payment_confirm": body.payment_confirm,
			"status_payment": "accepted",
			"remarks": body.remarks,
			"status_loi": statusLoi,
			"status_ta": statusTa,
			"type_mail": typeMail,
			"type_notif" : type_notif
		};		
		Agreements.paymentProcess(id, dataAccept).then(res => {
			resolve(res);
		})
		.catch(err => {
			reject({message: err.message});
		})
	});
});

agreementsSchema.static('rejectPayment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		
		let ObjectID = mongoose.Types.ObjectId;
		let body:any = data;
		let type:any = body.type;
		let receive_payment = body.receive_payment;
		let type_notif;
		let typeMail;		
		let statusTa;
		let statusLoi;
		if (type == "letter_of_intent") {
			typeMail = "rejectLoiPayment";
			type_notif = "paymentTARejected";
			statusLoi = "rejected";
		}
		if (type == "tenancy_agreement") {
			typeMail = "rejectTaPayment";
			type_notif = "paymentTARejected";
			statusTa = "rejected";
		}

		let dataReject = {
			"type": type,
			"receive_payment": receive_payment,
			"payment_confirm": body.payment_confirm,
			"status_payment": "rejected",
			"remarks": body.remarks,
			"status_loi": statusLoi,
			"status_ta": statusTa,
			"type_mail": typeMail,
			"type_notif" : type_notif
		};		
		Agreements.paymentProcess(id, dataReject).then(res => {
			resolve(res);
		})
		.catch(err => {
			reject({message: err.message});
		})
	});
});

agreementsSchema.static('getTotalStampCertificateNotUploaded', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let today = new Date();
		Agreements
			.find({})
			.where("tenancy_agreement.data.created_at").lte(today)
			.exec((err, agreements) => {
				if (err) {
					reject({message: err.message});
				}
				else if (agreements) {
					let count = 0;
					for (var i = 0; i < agreements.length; i++) {
						let agreement = agreements[i];
						if (!agreement.tenancy_agreement.data.stamp_certificate){
							count = count + 1;
						}
					}
					let data = { total: count };
					socketIo.socket(data, 'counterCertificate');
					resolve(data);
				}
			})
	});
});

agreementsSchema.static('penaltyPaymentAdminReject', (idPayment:string, remarks:string, receieveAmount:number):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Payments
			.findById(idPayment)
			.exec((err, res) => {
				if (err) {
					reject({message: err.message});
				}
				if (res) {
					let fees = res.fee;
					let needRefund = true
					if (!res.attachment.payment) {
						needRefund = false
					}
					for(var i = 0; i < fees.length; i++) {
						let fee = fees[i];
						let idFee = fee._id;
						let codeFee = fee.code_name;
						if (codeFee == "scd") {
							Payments
								.update({"_id": idPayment, "fee": {$elemMatch: {"_id": idFee}}},{
									$set: {
										"fee.$.needed_refund": needRefund,
										"fee.$.received_amount": receieveAmount,
										"fee.$.updated_at": new Date(),
										"remarks": remarks,
										"status": "rejected"
									}
								})
								.exec((err, result) => {
									err ? reject({message: err.message})
					            	  	: resolve(result);
								})
						}
						else if (codeFee != "gfd") {
							Payments
								.update({"_id": idPayment, "fee": {$elemMatch: {"_id": idFee}}},{
									$set: {
										"fee.$.needed_refund": needRefund,
										"fee.$.updated_at": new Date(),
										"remarks": remarks,
										"status": "rejected"
									}
								})
								.exec((err, result) => {
									err ? reject({message: err.message})
					            	  	: resolve(result);
								})
						}
					}
					resolve({message: "penalty payment updated"})
				}
			})					
	});
});

agreementsSchema.static('penaltyPayment', (idPayment:string, remarks:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Payments
			.findById(idPayment)
			.exec((err, res) => {
				if (err) {
					reject({message: err.message});
				}
				if (res) {
					let fees = res.fee;
					let needRefund = true
					if (!res.attachment.payment) {
						needRefund = false
					}
					for(var i = 0; i < fees.length; i++) {
						let fee = fees[i];
						let idFee = fee._id;
						let codeFee = fee.code_name;
						if (codeFee != "gfd") {
							Payments
								.update({"_id": idPayment, "fee": {$elemMatch: {"_id": idFee}}},{
									$set: {
										"fee.$.needed_refund": needRefund,
										"fee.$.updated_at": new Date(),
										"remarks": remarks
									}
								})
								.exec((err, result) => {
									err ? reject({message: err.message})
					            	  	: resolve(result);
								})
						}
					}
					resolve({message: "penalty payment updated"})
				}
			})					
	});
});

agreementsSchema.static('getTotalRefundPayment', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		let totalFee = 0;

		Payments
			.findById(id, (err, payments) => {
				if (payments) {
					for(var i = 0; i < payments.fee.length; i++) {
						let refunded = payments.fee[i].refunded;
						let fee = 0;
						if (refunded == false) {
							fee = payments.fee[i].received_amount;
							totalFee = totalFee + fee;
						}						
					}
					resolve({"total refund payment" : totalFee})
				}
				resolve({"refund payment" : "No Need Refund"})
			})
	});
});

agreementsSchema.static('refundPayment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		let body:any = data;
		let totalFee = 0;

		Payments
			.findById(id, (err, payments) => {
				if (payments) {
					for(var i = 0; i < payments.fee.length; i++) {
						let refunded = payments.fee[i].refunded;
						Payments
							.update({"_id": id, "fee":{ $elemMatch: {"needed_refund": true}}}, {
								$set: {
									"fee.$.refunded": true,
									"fee.$.updated_at": new Date(),
									"attachment.refund_confirm": body.refund_confirm
								},
							}, {multi: true})
							.exec((err, update) => {
				              err ? reject({message: err.message})
				            	  : resolve(update);
				            });									
					}
					resolve({"refund" : "success"})
				}
				resolve({"refund" : "no need refund"})
			})
	});
});

agreementsSchema.static('transferPenaltyToLandlord', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		let body:any = data;
		Agreements
			.findById(id)
			.exec((err, agreement) => {
				if (err) {
					reject({message: err.message});
				}
				if (agreement) {
					let paymentLoi = agreement.letter_of_intent.data.payment;
					let paymentTa = agreement.tenancy_agreement.data.payment;
					let taStatus = agreement.tenancy_agreement.data.status;

					if (taStatus == "rejected" || taStatus == "expired") {
						Payments.transferLandlord(paymentLoi, data).then((res)=>{
							Payments.transferLandlord(paymentTa, data).then((res)=>{
								resolve({message: "success transfer to landlord"})
							})
							.catch((err) => {
								reject({message: err.message});
							})
						})
						.catch((err) => {
							reject({message: err.message});
						})
					}	
					else {
						reject({message: "payment is processing or accepted"});
					}				
				}
			})
	});
});

agreementsSchema.static('transferToLandlord', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		let body:any = data;
		Agreements
			.findById(id)
			.exec((err, agreement) => {
				if (err) {
					reject({message: err.message});
				}
				if (agreement) {
					let paymentLoi = agreement.letter_of_intent.data.payment;
					let paymentTa = agreement.tenancy_agreement.data.payment;
					let taStatus = agreement.tenancy_agreement.data.status;

					if (taStatus == "accepted") {
						Payments.transferLandlord(paymentLoi, data).then((res)=>{
							Payments.transferLandlord(paymentTa, data).then((res)=>{
								resolve({message: "success transfer to landlord"})
							})
							.catch((err) => {
								reject({message: err.message});
							})
						})
						.catch((err) => {
							reject({message: err.message});
						})
					}
					else {
						reject({message: "status TA not accepted"})
					}
				}
			})
	});
});

agreementsSchema.static('getCertificateStampDuty', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {

		let _query = {$and: [{"letter_of_intent.data.status": "accepted"},{"tenancy_agreement.data.status": "accepted"}]};

		Agreements
			.find(_query)
			.populate("property landlord tenant tenancy_agreement.data.stamp_certificate")
			.populate({
				path: 'letter_of_intent.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				},
				{
					path: 'transfer_landlord.attachment',
					model: 'Attachments'
				}]
			})
			.populate({
				path: 'tenancy_agreement.data.payment',
				populate: [{
					path: 'attachment.payment',
					model: 'Attachments'
				},
				{
					path: 'attachment.payment_confirm',
					model: 'Attachments'
				},
				{
					path: 'attachment.refund_confirm',
					model: 'Attachments'
				}]
			})
			.exec((err, res) => {
				if (err) {
					reject({message: err.message});
				}
				if (res) {
					if (res.length == 0) {
						resolve(res)
					}
					if (res.length >= 1) {
						let dataArr = [];
						for(var i = 0; i < res.length; i++) {
							let result = res[i];
							let idagreement = result._id;
							let ta = result.tenancy_agreement.data
							let loi = result.	letter_of_intent.data;
		                    let gfd = loi.gfd_amount;
		                    let std = loi.sd_amount;
		                    let scd = loi.security_deposit;
		                    let stampFee = loi.sd_amount;   
		                    let totalCollected = gfd + std + scd;
		                    let monthlyRental = loi.monthly_rental;
		                    let termLease = loi.term_lease;
		                    let feeEarned;
		                    if (termLease == 6) {
		                        feeEarned = 10/100 * (1/4 * monthlyRental);
		                    }
		                    if (termLease == 12) {
		                        feeEarned = 10/100 * (1/2 * monthlyRental);
		                    }
		                    if (termLease == 24) {
		                        feeEarned = 10/100 * (1 * monthlyRental);
		                    }
		                    let amountLandlord = totalCollected - stampFee - feeEarned;
		                    let floor = result.property.address.floor;
		                    let unit = result.property.address.unit;
		                    let streetName = result.property.address.street_name;
		                    let dateListed = result.property.confirmation.date;
		                    let landlordName = result.landlord.username;
		                    let tenantName = result.tenant.username;
		                    let dateTaConcluded = ta.payment.attachment.payment_confirm.uploaded_at
		                    let transferredLandlord;
		                    let dateTransferredLandlord;
		                    let transferReferenceLoi;
		                    if (loi.payment.attachment.payment_confirm) {
		                    	transferReferenceLoi = loi.payment.attachment.payment_confirm;
		                    }
		                    let transferReferenceTa;
		                    let attachmentTransferredLandlord;
		                    if (ta.payment.attachment.payment_confirm) {
		                    	transferReferenceTa = ta.payment.attachment.payment_confirm;
		                    }
		                    if (loi.payment.transfer_landlord) {
		                    	transferredLandlord = loi.payment.transfer_landlord.transfer;
			                    dateTransferredLandlord = loi.payment.transfer_landlord.date_transferred;
			                    if (loi.payment.transfer_landlord.attachment) {
			                    	attachmentTransferredLandlord = loi.payment.transfer_landlord.attachment;
			                    }			                    
		                    }		                    
		                    let stampCertificate = ta.stamp_certificate;

		                    let data = {
		                    	"idagreement": idagreement,
		                    	"property": "# " + floor + " - " + unit + " " + streetName,
		                    	"date_listed": dateListed,
		                    	"landlord": landlordName,
		                    	"tenant": tenantName,
		                    	"rental": monthlyRental,
		                    	"tenure": termLease,
		                    	"dateTaConcluded": dateTaConcluded,
		                    	"total_collected": totalCollected,
		                    	"stamp_fee": stampFee,
		                    	"fee_earned": feeEarned,
		                    	"amount_transferred_landlord": amountLandlord,
		                    	"transferred_landlord": transferredLandlord,
		                    	"date_transffered": dateTransferredLandlord,
		                    	"transfer_reference_loi": transferReferenceLoi,
		                    	"transfer_reference_ta": transferReferenceTa,
		                    	"attachment_transfer_landlord": attachmentTransferredLandlord,
		                    	"stamp_certificate": stampCertificate
		                    }
		                    dataArr.push(data);
						}					
					resolve(dataArr)
					}					
				}
			})
	});
});

//notification
agreementsSchema.static('notification', (id:string, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let message = "";
		let type_notif = "";
		let user = "";
		Agreements
			.findById(id, (err, agreement) => {
				let agreementId = agreement._id;
				let tenantId = agreement.tenant;
				let landlordId = agreement.landlord;
				let propertyId = agreement.property;
				Properties
			        .findById(propertyId, (err, result) => {
			          var devID = result.development;
			          var unit = '#' + result.address.floor + '-' + result.address.unit;
			          Developments
			            .findById(devID, (error, devResult) => {
			            	if (type == "initiateLoi") {
								message = "Letter of Intent (LOI) received for " + unit + " " + devResult.name;
								type_notif = "received_LOI";
								user = landlordId;
							}
			            	if (type == "rejectLoi") {
								message = "Letter of Intent (LOI) rejected for " + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
								user = tenantId;
							}
							if (type == "rejectLoiLandlord") {
								message = "Letter of Intent (LOI) rejected for " + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
								user = tenantId;
							}
							if (type == "expiredLoi") {
								message = "Letter of Intent (LOI) expired for " + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
								user = tenantId;
							}
							if (type == "expiredLoilandlord") {
								message = "Letter of Intent (LOI) expired for " + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
								user = landlordId;
							}
							if (type == "acceptLoi") {
								message = "Letter of Intent (LOI) accepted for " + unit + " " + devResult.name;
								type_notif = "accepted_LOI";
								user = tenantId;
							}
							if (type == "initiateTA") {
								message = "Tenancy Agreement (TA) received for " + unit + " " + devResult.name;
								type_notif = "received_TA";
								user = tenantId;
							}
			            	if (type == "rejectTA") {
								message = "Tenancy Agreement (TA) rejected for " + unit + " " + devResult.name;
								type_notif = "rejected_TA";
								user = landlordId;
							}
							if (type == "acceptTA") {
								message = "Tenancy Agreement (TA) accepted for " + unit + " " + devResult.name;
								type_notif = "accepted_TA";
								user = landlordId;
							}
							if (type == "expiredTA") {
								message = "Tenancy Agreement (TA) expired for " + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
								user = tenantId;
							}
							if (type == "expiredTALandlord") {
								message = "Tenancy Agreement (TA) expired for " + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
								user = landlordId;
							}
							if (type == "initiateIL") {
								message = "Inventory List received for " + unit + " " + devResult.name;
								type_notif = "received_Inventory";
								user = tenantId;
							}
			            	if (type == "confirmedIL") {
								message = "Inventory List confirmed for " + unit + " " + devResult.name;
								type_notif = "confirm_Inventory";
								user = landlordId;
							}
							if (type == "paymentLOIAccepted") {
								message = "Good Faith Deposit (GFD) received for " + unit + " " + devResult.name;
								type_notif = "payment_LOI";
								user = landlordId;
							}
							if (type == "paymentLOIRejected") {
								message = "Good Faith Deposit (GFD) rejected for " + unit + " " + devResult.name;
								type_notif = "payment_LOI";
								user = tenantId;
							}
							if (type == "paymentTAAccepted") {
								message = "Security Deposit (SD) received for " + unit + " " + devResult.name;
								type_notif = "payment_TA";
								user = landlordId;
							}
							if (type == "paymentTARejected") {
								message = "Security Deposit (SD) rejected for " + unit + " " + devResult.name;
								type_notif = "payment_TA";
								user = landlordId;
							}
							if (type == "certificateStampDuty") {
								message = "Certificate of Stamp Duty received for " + unit + " " + devResult.name;
								type_notif = "certificate_ta";
								user = landlordId;
							}
				            var notification = {
				            	"user": user,
				                "message": message,
				                "type": type_notif,
				                "ref_id": id
				              };
			              Notifications.createNotifications(notification);        
			            })
			            .exec((err, update) => {
			              err ? reject({message: err.message})
			              : resolve(update);
			            });
			})
        })		
	});
});

agreementsSchema.static('email', (idAgreement:string, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let message = "";
		let type_notif = "";
		let user = "";
		Agreements
			.findById(idAgreement)
			.populate("landlord tenant property")
			.exec((err, agreement) => {
				let landlordEmail = agreement.landlord.email;
				let landlordUsername = agreement.landlord.username;
				let landlordName = agreement.landlord.landlord.data.name;
				let tenantEmail = agreement.tenant.email;
				let tenantUsername = agreement.tenant.username;
				let tenantName = agreement.tenant.tenant.data.name;
				let fulladdress = agreement.property.address.full_address;
				let by = 'Admin Staysmart';
				let from = 'Staysmart';
				let tenantplace = 'Good Place';
				if (type == 'initiateLoi') {
					mail.initiateLOI(landlordEmail, landlordName, tenantUsername, fulladdress, from);
				}
				if (type == 'acceptedLoiLandlord') {
					mail.acceptedLoiLandlord(tenantEmail, tenantName, landlordUsername, fulladdress, from);
				}
				if (type == 'expiredLoiLandlord') {
					mail.expiredLoiLandlord(tenantEmail, tenantName, fulladdress, from);
				}
				if (type == 'acceptLoiPayment') {
					mail.acceptLoiPayment(tenantEmail, tenantName, fulladdress, by, from);
				}
				if (type == 'rejectLoiPayment') {
					mail.rejectLoiPayment(tenantEmail, tenantName, fulladdress, by, from);
				}
				if (type == 'rejectLoiLandlord') {
					mail.rejectLoiLandlord(tenantEmail, tenantName, landlordUsername, fulladdress, by, from);
				}
				if (type == 'rejectLoiAdmin') {
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.rejectLoiAdmin(email, fullname, fulladdress, from);
				}
				if (type == 'initiateTaLandlord') {
					mail.initiateTaLandlord(tenantEmail, tenantName, landlordUsername, fulladdress, from);
				}
				if (type == 'initiateTaTenant') {
					mail.initiateTaLandlord(landlordEmail, landlordName, tenantUsername, fulladdress, from);
				}
				if (type == 'acceptTa') {
					mail.acceptTa(tenantEmail, tenantName, fulladdress, landlordUsername, from);
				}
				if (type == 'expiredTa') {
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.expiredTa(email, fullname, fulladdress, from);
				}
				if (type == 'expiredLoi') {
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.expiredLoi(email, fullname, fulladdress, from);
				}
				if (type == 'acceptTaPayment') {
					mail.acceptTaPayment(tenantEmail, tenantName, fulladdress, by, from);
				}
				if (type == 'rejectTaPayment') {
					mail.rejectTaPayment(tenantEmail, tenantName, fulladdress, by, from);
				}
				if (type == 'rejectTa') {
					mail.rejectTa(tenantEmail, tenantName, fulladdress, by, tenantplace, from);
				}
				if (type == 'rejectTaAdmin') {
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.rejectLoiAdmin(email, fullname, fulladdress, from);
				}
				if (type == 'stampCertificateTa') {
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.stampCertificateTa(email, fullname, fulladdress, by, from);
				}				
				if (type == 'createInventory') {
					mail.createInventory(tenantEmail, tenantUsername, landlordUsername, fulladdress, from);
				}
				if (type == 'updateInventory') {
					mail.updateInventory(tenantEmail, tenantUsername, landlordUsername, fulladdress, from);
				}
				if (type == 'confirmInventory') {
					mail.confirmInventory(landlordEmail, tenantUsername, landlordUsername, fulladdress, from);
				}
			})		
	});
});

agreementsSchema.static('inventoryUpdateMobile', (idAppointment: string, data: Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body: any = data;
		Agreements.findOne({"appointment": idAppointment}).exec((err, agreement) => {
			if (err) { reject({message: err.message}); }
			else {
				if (body.list) {
					let lists = [];
					for (var i = 0; i < body.list.length; i++) {
						let list = body.list[i];
						let items = [];
						for (var j = 0; j < list.attr.length; j++) {
							items.push({
								name: list.attr[j].item,
								quantity: list.attr[j].quantity,
								row_id: list.attr[j].row_id,
								tenant_check: list.attr[j].confirm_by_tenant,
								landlord_check: list.attr[j].confirm_by_landlord
							});
						}
						lists.push({
							name: list.area_name,
							items: items
						});
					}
					agreement.inventory_list.data.lists = lists;
					agreement.save();
				}
				if (body.tenant_sign) {
					agreement.inventory_list.data.confirmation.tenant.sign = body.tenant_sign;
					agreement.inventory_list.data.confirmation.tenant.date = new Date();
					agreement.save();
				}
				resolve({
					message: 'success',
					code: 200
				});
			}
		});
	});
});

agreementsSchema.static('inventoryDetailsMobile', (id: string, user: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements.findById(id).populate('inventory_list.data.lists.items.attachments').exec((err, agreement) => {
			if (err) { reject({message: err.message}); }
			else {
				let lists = [];
				for (var i = 0; i < agreement.inventory_list.data.lists.length; i++) {
					let list = agreement.inventory_list.data.lists[i];
					let items = [];
					for (var j = 0; j < list.items.length; j++) {
						let img = [];
						for (var k = 0; k < list.items[j].attachments.length; k++) {
							img.push(list.items[j].attachments[k].url);
						}
						items.push({
							confirm_by_landlord: list.items[j].landlord_check,
							confirm_by_tenant: list.items[j].tenant_check,
							item: list.items[j].name,
							quantity: list.items[j].quantity,
							remark: list.items[j].remark,
							row: j > 9 ? j : '0'+j,
							row_id: list.items[j].row_id,
							photo: img
						});
					}
					lists.push({
						area_name: list.name,
						attr: items
					});
				}
				Properties.getById(agreement.property, user, 'phone').then(property => {
					resolve({
						_id: agreement._id,
						appointment_id: agreement.appointment,
						landlord_sign: agreement.inventory_list.data.confirmation.landlord.sign,
						tenant_signDate: agreement.inventory_list.data.confirmation.tenant.date,
						landlord_signDate: agreement.inventory_list.data.confirmation.landlord.date,
						status: agreement.inventory_list.data.status,
						property: property,
						created_at: agreement.inventory_list.data.created_at,
						list: lists,
						tenant_sign: agreement.inventory_list.data.confirmation.tenant.sign
					});
				})
			}
		});
	});
});

agreementsSchema.static('inventoryListMember', (user: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements.find({ $or: [{"tenant": user}, {"landlord": user}]})
		.populate([
			{
				path: 'landlord',
				model: 'Users',
				populate: {
					path: 'picture',
					model: 'Attachments'
				}
			},
			{
				path: 'tenant',
				model: 'Users',
				populate: {
					path: 'picture',
					model: 'Attachments'
				}
			},
			{
				path: 'property',
				model: 'Properties',
				populate: {
					path: 'development',
					model: 'Developments'
				}
			}
		])
		.exec((err, agreements) => {
			if (err) { reject({message: err.message}); }
			else {
				let aggr = [];
				for (var i = 0; i < agreements.length; i++) {
					aggr.push({
						_id: agreements[i]._id,
						appointment_id: agreements[i].appointment,
						property: {
							_id: agreements[i].property._id,
							development: agreements[i].property.development.name,
							address: {
								unit_no: agreements[i].property.address.floor,
								unit_no_2: agreements[i].property.address.unit,
								block_no: agreements[i].property.address.block_number,
								street_name: agreements[i].property.address.street_name,
								postal_code: agreements[i].property.address.postal_code,
								country: agreements[i].property.address.country
							},
							details: {
								furnishing: agreements[i].property.details.furnishing,
								price: agreements[i].property.price,
								size: agreements[i].property.size_sqf,
								size_sqm: agreements[i].property.size_sqm,
								psqft: agreements[i].property.psqf
							}
						},
						landlord: {
							_id: agreements[i].landlord._id,
							profile_picture: agreements[i].landlord.picture ? agreements[i].landlord.picture.url : ''
						},
						tenant: {
							_id: agreements[i].tenant._id,
							profile_picture: agreements[i].tenant.picture ? agreements[i].tenant.picture.url : ''
						},
						status: agreements[i].inventory_list.data.status,
						created_at: agreements[i].inventory_list.data.created_at
					});
				}
				resolve(aggr);
			}
		});
	});
});

agreementsSchema.static('rejectTAMobile', (idAppointment:string, userId:string, role:string, ta:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body: any = ta;
		let data = {remarks: body.rejected_reason};
		Agreements.findOne({"appointment": idAppointment}).exec((err, agreement) => {
			if (err) { reject({message: err.message}); }
			else {
				Agreements.rejectTA(agreement._id, userId, role, data).then(res => {
					resolve(res);
				})
			}
		})
	});
});

agreementsSchema.static('expiredPropertyRented', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let today = new Date();
        Agreements
          .find({})
          .where("tenancy_agreement.data.status").in(['accepted'])
          .exec((err, agreement) => {
            if (err) {reject({message: err.message});}
            else {
              let agreementData = agreement;
              for(var i = 0; i < agreementData.length; i++){				  
                let idAgreement = agreementData[i]._id;
                let dateCommencement = agreementData[i].letter_of_intent.data.date_commencement;
                let termLease = agreementData[i].letter_of_intent.data.term_lease;
                let expiredRented = new Date(dateCommencement.setMonth(dateCommencement.getMonth() + termLease));
				let todayDate = today.getDate() +" - "+ today.getMonth() +" - "+ today.getFullYear();
				let expiredDate = expiredRented.getDate() +" - "+ expiredRented.getMonth() +" - "+ expiredRented.getFullYear();
                let type = "expiredRented";                
                if (todayDate == expiredDate) {
					console.log("today expired", idAgreement);
					let typeDataa = ["letter_of_intent", "tenancy_agreement", "inventory_list"];
					for (var a = 0; a < typeDataa.length; a++) {
						Agreements.createHistory(idAgreement, typeDataa[a]);
					}
					Properties
						.update({"_id":agreementData[i].property}, {$set: {status: "published"}})
						.exec((err, updated) => {
							err ? reject({message: err.message}) 
								: resolve({message: "Property updated"});
						})
                }
              }
            }              
          })
	});
});

agreementsSchema.static('getUserLOI', (userId: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements.find({$or: [{"tenant": userId}, {"landlord": userId}]})
		.populate([{
			path: 'tenant',
			model: 'Users',
			populate: {
				path: 'picture',
				model: 'Attachments'
			}
		}, {
			path: 'landlord',
			model: 'Users',
			populate: {
				path: 'picture',
				model: 'Attachments'
			}
		}, {
			path: 'letter_of_intent.data.tenant.identification_proof.front',
			model: 'Attachments'
		}, {
			path: 'letter_of_intent.data.tenant.identification_proof.back',
			model: 'Attachments'
		}, {
			path: 'letter_of_intent.data.payment',
			model: 'Payments'
		}])
		.exec((err, agreements) => {
			if (err) { reject({message: err.message}); }
			else {
				Properties.getAll('phone', userId, 'all').then(properties => {
					let user_loi = [];
					let unread = 0;
					let total = 0;
					for (var a = 0; a < agreements; a++) {
						if (agreements[a].letter_of_intent.data) {
							let loi = agreements[a].letter_of_intent.data;
							total += 1;
							String(userId) == String(agreements[a].tenant._id) ? loi.tenant_seen == false ? unread += 1 : unread += 0 : unread += 0;
							String(userId) == String(agreements[a].landlord._id) ? loi.landlord_seen == false ? unread += 1 : unread += 0 : unread += 0;
						}
					}
					for (var a = 0; a < agreements; a++) {
						if (agreements[a].letter_of_intent.data) {
							let loi = agreements[a].letter_of_intent.data;
							let as_landlord = (String(userId) == String(agreements[a].tenant._id)) ? false : true;
							let TA = agreements[a].tenancy_agreement.data ? true : false;
							let seen_by = [];
							loi.tenant_seen == true ? seen_by.push(agreements[a].tenant._id) : '';
							loi.landlord_seen == true ? seen_by.push(agreements[a].landlord._id) : '';
							for (var b = 0; b < properties.length; b++) {
								if (String(properties[b]._id) == String(agreements[a].property)) {
									user_loi.push({
										_id: agreements[a]._id,
										appointment_id: agreements[a].appointment ? agreements[a].appointment : '',
										as_landlord: as_landlord,
										property: properties[b],
										landlord: {
											full_name: loi.landlord.name,
											id_number: loi.landlord.identification_number,
											_id: agreements[a].landlord._id,
											username: agreements[a].landlord.username,
											profile_picture: agreements[a].landlord.picture ? agreements[a].landlord.picture.url : agreements[a].landlord.service ? agreements[a].landlord.service.facebook ? agreements[a].landlord.service.facebook.picture ? agreements[a].landlord.service.facebook.picture : '' : '' : ''
										},
										tenant: {
											name: loi.tenant.name,
											type: loi.tenant.identification_type,
											id_no: loi.tenant.identification_number,
											identity_front: loi.tenant.identification_proof.front.url,
											identity_back: loi.tenant.identification_proof.back ? loi.tenant.identification_proof.back.url : '',
											_id: agreements[a].tenant._id,
											username: agreements[a].tenant.username,
											profile_picture: agreements[a].tenant.picture ? agreements[a].tenant.picture.url : agreements[a].tenant.service ? agreements[a].tenant.service.facebook ? agreements[a].tenant.service.facebook.picture ? agreements[a].tenant.service.facebook.picture : '' : '' : ''
										},
										status: loi.status,
										send: loi.status == 'draft' ? false : true,
										TA: TA,
										created_at: loi.created_at,
										payment_details: { 
											status: loi.payment.status
										},
										seen_by: seen_by,
										read: as_landlord == true ? loi.landlord_seen : loi.tenant_seen,
										unread: unread,
										total: total
									});
								}
							}
						}
					}
					resolve(user_loi);
				});
			}
		});
	});
});

let Agreements = mongoose.model('Agreements', agreementsSchema);

export default Agreements;