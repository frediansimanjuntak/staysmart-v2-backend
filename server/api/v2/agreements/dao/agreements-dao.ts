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
import {mail} from '../../../../email/mail';

agreementsSchema.static('getAll', (userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		
		if(role == "admin"){
			let _query = {};
			Agreements
			.find(_query)
			.populate("landlord tenant property")
			.populate({
				path: 'letter_of_intent.data.payment',
				populate: {
					path: 'attachment.payment',
					model: 'Attachments'
				}
			})
			.populate({
				path: 'tenancy_agreement.data.payment',
				populate: {
					path: 'attachment.payment',
					model: 'Attachments'
				}
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
			.exec((err, agreements) => {
				err ? reject(err)
					: resolve(agreements);
			});
		}
		else{
			Agreements
			.find({$or: [{"tenant": userId},{"landlord":userId}] })
			.populate("landlord tenant property")
			.populate({
				path: 'letter_of_intent.data.payment',
				populate: {
					path: 'attachment.payment',
					model: 'Attachments'
				}
			})
			.populate({
				path: 'tenancy_agreement.data.payment',
				populate: {
					path: 'attachment.payment',
					model: 'Attachments'
				}
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
			.exec((err, agreements) => {
				err ? reject(err)
					: resolve(agreements);
			});
		}
	});
});

agreementsSchema.static('getById', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.populate({
				path: 'letter_of_intent.data.payment',
				populate: {
					path: 'attachment.payment',
					model: 'Attachments'
				}
			})
			.populate({
				path: 'tenancy_agreement.data.payment',
				populate: {
					path: 'attachment.payment',
					model: 'Attachments'
				}
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
			.exec((err, agreements) => {
				err ? reject(err)
					: resolve(agreements);
			});
	});
});

agreementsSchema.static('createAgreements', (agreements:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}
		let body:any = agreements;
		if(!body.property) {
			reject({message: 'no property id'});
		}
		else{
			Properties
				.findById(body.property)
				.exec((err, properties) => {
					if(err){
						reject(err);
					}
					else{
						let propertyId = properties._id;
						let propertyStatus = properties.status;
						let landlordId = properties.owner.user;
						Agreements
							.findOne({"property": body.property, "tenant": userId})
							.exec((err, agreement) => {
								if(err){
									reject(err);
								}
								else{
									if(agreement == null){
										if(propertyStatus == "published" || propertyStatus == "initiated"){
											var _agreements = new Agreements();
												_agreements.property = propertyId;
												_agreements.tenant =  userId;
												_agreements.landlord = landlordId;
												if(body.appointment) {
													_agreements.appointment = body.appointment;
												}
												_agreements.save((err, saved)=>{
													err ? reject(err)
														: resolve({agreement_id: saved._id});
												});
										}
										else{
											reject({message: "this property has rented"})
										}
									}
									else if(agreement != null){
										resolve({message: "agreement has been made"})
									}
								}							
							});					
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
				err ? reject(err)
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
				err ? reject(err)
					: resolve(updated);
			});
	});
});

//LOI
agreementsSchema.static('getLoi', (id:string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Agreements
			.findById(id)
			.select("letter_of_intent.data")
			.populate("landlord tenant property letter_of_intent.data.tenant.bank_account.bank")
			.populate({
				path: 'letter_of_intent.data.payment',
				populate: {
					path: 'attachment.payment',
					model: 'Attachments'
				}
			})
			.exec((err, agreements) => {
				err ? reject(err)
					: resolve(agreements.letter_of_intent.data);
			});
	});
});

agreementsSchema.static('createLoi', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		let body:any = data;
		let typeDataa = "letter_of_intent";
		let tenant = body.tenant;
		let IDUser = userId.toString();
		let inputBankNo = body.tenant.bank_account.no;
		Agreements
			.findById(id)
			.populate ("landlord tenant property appointment")
			.exec((err, agreement) => {
				if(agreement){
					let propertyID = agreement.property._id;
					let landlordID = agreement.landlord._id;
					let landlordData = agreement.landlord.landlord.data;
					let tenantID = agreement.tenant._id;
					let tenantData = agreement.tenant.tenant.data;
					let appointmentID;
					if(agreement.appointment){
						appointmentID = agreement.appointment._id;
					}				
					let loi = agreement.letter_of_intent.data;
					if (tenantID != IDUser){
						resolve({message: "forbidden"});
					}
					if (tenantID == IDUser){
						if(loi.created_at){
							Agreements.createHistory(id, typeDataa);
							Agreements
								.findByIdAndUpdate(id, {
									$unset: {
										"letter_of_intent.data": ""
									}
								})
								.exec((err, updated) => {
									if(err){
										reject(err);
									}
								});
						}
						if(!tenantData.name){
							Users
								.findByIdAndUpdate(userId, {
									$set: {
										"tenant.data": body.tenant
									}
								})
								.exec((err, updated) => {
									if(err){
										reject(err);
									}
								});
						}
						Users
							.findOne({"_id": tenantID, "tenant.data.bank_account.no": inputBankNo}, (err, user) => {
								if (user == null){
									Users
										.update({"_id": id}, {												
											$set:{
												"tenant.data.bank_account": {
													"no": body.tenant.bank_account.no,
													"name": body.tenant.bank_account.name,
													"bank": body.tenant.bank_account.bank
												}
											}
										})
										.exec((err, updated) => {
											if(err){
												reject(err);
											}
										});
								}
							})
						let monthly_rental = body.monthly_rental;
						let term_lease = body.term_lease;
						let security_deposit = 0;
						let gfd_amount = monthly_rental;
						let sd_amount = Math.round((monthly_rental * term_lease) * 0.4 / 100);
						let remark = body.remark_payment;

						if (term_lease <= 12){
							security_deposit = gfd_amount;
						}
						else if(term_lease > 12 && term_lease <= 24){
							security_deposit = gfd_amount * 2;
						}

						let _query = {"_id": id};
						let loiObj = {$set: {}};
					    for(var param in body) {
					    	loiObj.$set["letter_of_intent.data." + param] = body[param];
					    }
					    loiObj.$set["letter_of_intent.data.gfd_amount"] = gfd_amount;
						loiObj.$set["letter_of_intent.data.sd_amount"] = sd_amount;
					    loiObj.$set["letter_of_intent.data.security_deposit"] = security_deposit;
					    loiObj.$set["letter_of_intent.data.landlord"] = landlordData;
					    loiObj.$set["letter_of_intent.data.status"] = "draft";
					    loiObj.$set["letter_of_intent.data.created_at"] = new Date();

						Agreements
							.update(_query, loiObj)
							.exec((err, updated) => {
								err ? reject(err)
									: resolve({message: "Loi created"});
							});				
					}
				}
				else if (err){
					reject(err);
				}	
			})		
	});
});

agreementsSchema.static('sendLoi', (id:string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		Agreements
			.findById(id)
			.populate("landlord tenant property letter_of_intent.data.payment")
			.exec((err, agreement) => {
				if(err){
					reject(err);
				}
				else if(agreement){
					let tenantId = agreement.tenant._id;
					let propertyId = agreement.property._id;
					if(tenantId != IDUser){
						resolve({message: "forbidden"});
					}
					else if(tenantId == IDUser){
						agreement.letter_of_intent.data.status = "pending";
						agreement.save((err, saved) => {
							if(err){
								reject(err);
							}
							if(saved){
								Properties
									.update({"_id": propertyId}, {
										$set: {
											"status": "initiated"
										}
									})
									.exec((err, updated) => {
										if(err){
											reject(err)
										}
										else if(updated){
											let type = "initiateLoi";
											Agreements.email(id, type);
											Agreements.notification(id, type);
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

		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {
				let landlordId = agreement.landlord._id;
				if (landlordId != IDUser){
					resolve({message: "forbidden"});
				}
				else if(landlordId == IDUser){
					agreement.letter_of_intent.data.status = "accepted";
					agreement.save((err, saved) => {
						Agreements.confirmation(id, data, type)
						Agreements.notification(id, type_notif).then(res => {
							let typeMail = "acceptedLoiLandlord";
							Agreements.email(id, typeMail);
							resolve(saved);
						});
					})
				}
			})			
	});
});

agreementsSchema.static('rejectLoi', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();

		Agreements
			.findById(id)
			.populate("landlord tenant letter_of_intent.data.payment")
			.exec((err, agreement) => {
				let landlordID = agreement.landlord._id;
				if(err){
					reject(err);
				}
				else if(agreement){
					if(landlordID != IDUser){
						resolve({message: "forbidden"});
					}
					else if(landlordID == IDUser || role == 'admin'){
						let payment = agreement.letter_of_intent.data.payment;
						let paymentId = payment._id;
						let paymentStatus = payment.status;
						let paymentFee = payment.fee;
						if(paymentStatus == "rejected"){
							resolve({message: "this payment has rejected"})
						}

						if(paymentStatus == "pending" || paymentStatus == "accepted"){
							for(var i = 0; i < paymentFee.length; i++){
								Payments
									.update({"_id": id, "fee":{ $elemMatch: {"needed_refund": false}}}, {
										$set: {
											"fee.$.needed_refund": true,
											"fee.$.updated_at": new Date()
										},
									}, {multi: true})
									.exec((err, update) => {
					            	if(err){
					            		reject(err);
					            	}
					            });			
							}
							agreement.letter_of_intent.data.status = "rejected";
							agreement.save((err, saved)=>{
								if(err){
									reject(err)
								}
								else if (saved){
									let typeMail;
									if(role == 'admin'){
										typeMail = "rejectLoiAdmin";
									}
									if(landlordID == IDUser){
										typeMail = "rejectLoiLandlord";
									}
									Agreements.email(id, typeMail).then(res => {
										resolve(res);
									})
								}
							});							
						}
					}						
				}
			})
	});
});

//TA
agreementsSchema.static('getTA', (id:string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		Agreements
			.findById(id)
			.select("tenancy_agreement.data")
			.exec((err, agreements) => {
				err ? reject(err)
					: resolve(agreements.tenancy_agreement.data);
			});
	});
});

agreementsSchema.static('createTA', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}

		let type = "tenancy_agreement";
		let body:any = data;
		let bankNo = body.no;
		let IDUser = userId.toString();
		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {				
				if(err){
					reject(err)
				}
				else if(agreement){
					let landlordId = agreement.landlord._id;
					let landlordDataBank = agreement.landlord.landlord.data.bank_account;
					let ta = agreement.tenancy_agreement.data;
					if (landlordId != IDUser){
						resolve({message: "forbidden"});
					}
					else if(landlordId == IDUser){
						if (!ta){
							Agreements.createHistory(id, type);
							Agreements
								.findByIdAndUpdate(id, {
									$unset: {
										"tenancy_agreement.data": ""
									}
								})
								.exec((err, updated) => {
									if(err){
										reject(err);
									}
								});
						}
						if(landlordDataBank.no != bankNo){
							Users
								.update({"_id": landlordId}, {
									$push: {
										"landlord.histories": {
											"date": new Date(),
											"data": landlordDataBank
										}
									},
									$set: {
										"landlord.data.bank_account": {
												"no": body.no,
												"name": body.name,
												"bank": body.bank
											}
									}
								})
								.exec((err, updated) => {
									if(err){
										reject(err)
									}
								})
						}
						agreement.letter_of_intent.data.landlord.bank_account.no = body.no;
						agreement.letter_of_intent.data.landlord.bank_account.name = body.name;
						agreement.letter_of_intent.data.landlord.bank_account.bank = body.bank;	
						agreement.tenancy_agreement.data.status = "pending";
						agreement.tenancy_agreement.data.created_at = new Date();
						agreement.save((err, saved)=>{
							err ? reject(err)
								: resolve(saved);
						});
					}
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
		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {
				if(err){
					reject(err);
				}
				else if(agreement){
					let propertyId = agreement.property._id;
					let landlordId = agreement.landlord._id;
					if(landlordId != IDUser){
						reject({message:"forbidden"});
					}
					else if(landlordId == IDUser){
						let type = "tenancy_agreement";
						let typeNotif = "initiateTA";
						let typeEmailLandlord = "initiateTaLandlord";
						let typeEmailTenant = "initiateTaTenant";
						Agreements.confirmation(id, data, type);
						Agreements.email(id, typeEmailLandlord);
						Agreements.email(id, typeEmailTenant);
						Agreements.notification(id, typeNotif);
						resolve({message: "Send Ta Success"});
					}
				}
		})
	});
});

agreementsSchema.static('acceptTA', (id:string, data:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {
				if(err){
					reject (err);
				}
				else if (agreement){					
					let propertyId = agreement.property._id;
					let tenantId = agreement.tenant._id;
					let landlordId = agreement.landlord._id;

					if(tenantId != IDUser){
						resolve({message: "forbidden"})
					}
					else if(tenantId == IDUser){
						let termLeaseExtend
						if(agreement.letter_of_intent.data.term_lease_extend){
							termLeaseExtend = agreement.letter_of_intent.data.term_lease_extend;
						}
						else if(!agreement.letter_of_intent.data.term_lease_extend){
							termLeaseExtend = 0;
						}						
						let dateCommencement = agreement.letter_of_intent.data.date_commencement;
						let termLease = agreement.letter_of_intent.data.term_lease;
						let longTerm = termLease + termLeaseExtend;
						let until = dateCommencement.setDate(dateCommencement.getMonth() + longTerm);
						Properties
						.findByIdAndUpdate(propertyId, {
							$set: {
								"status": "rented"
							}
						})
						.exec((err, updated) => {
							if(err){
								reject(err);
							}
							if(updated){
								Users
									.findByIdAndUpdate(tenantId, {
										$push: {
											"rented_properties": {
												"until": until,
												"property": propertyId,
												"agreement": id
											}
										}
									})
									.exec((err, updated) => {
										if(err){
											reject(err);
										}
									});
							}
						});
						agreement.tenancy_agreement.data.status = "admin-confirmation";
						agreement.tenancy_agreement.data.created_at = new Date();
						agreement.save((err, saved)=>{
							if(err){
								reject(err);
							}
							else if(saved){
								let type_notif = "acceptTA";
								let typeEmail = "acceptTa";
								let type = "tenancy_agreement";
								Agreements.email(id, typeEmail);
								Agreements.notification(id, type_notif);
								Agreements.confirmation(id, data, type);
								resolve({status: "TA "+ saved.tenancy_agreement.data.status});
							}						
						});
					}					
				}
			})					
	});
});

agreementsSchema.static('rejectTA', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {
				if(err){
					reject(err);
				}
				if(agreement){
					let landlordId = agreement.landlord._id;
					let tenantId = agreement.tenant._id;

					if(tenantId != IDUser){
						reject({message:"forbidden"});
					}
					if(tenantId == IDUser || role == "admin"){
						agreement.tenancy_agreement.data.status = "rejected";
						agreement.save((err, saved) => {
							if(err){
								reject(err);
							}
							else if(saved){
								if(landlordId == IDUser){
									let typeEmail = "rejectTa";
									Agreements.email(id, typeEmail);
								}
								if(role == "admin"){
									let typeEmail = "rejectTaAdmin";
									Agreements.email(id, typeEmail);
								}
								resolve(saved);
							}
						})
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
				err ? reject(err)
					: resolve({message: "uploaded"});
				let typeEmail = "stampCertificateTa";
				Agreements.email(id, typeEmail);
			})
	});
});

//inventory list
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
				err ? reject(err)
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
				if(err){
					reject(err);
				}
				if(agreement){
					let landlordId = agreement.landlord._id;
					let tenantId = agreement.tenant._id;
					let propertyId = agreement.property._id;
					let il = agreement.inventory_list.data;

					if (landlordId != IDUser){
						reject ({message: "sorry you can not create this Inventory List"});
					}
					else if(landlordId == IDUser){
						if(il.status == "pending"){
							let typeDataa = "inventory_list";
							Agreements.createHistory(id, typeDataa).then(res => {
								Agreements
									.findByIdAndUpdate(id, {
										$unset: {
											"inventory_list.data": ""
										}
									})
									.exec((err, update) => {
										if(err) {
											reject(err);
										}
										else if(update) {
											agreement.inventory_list.data.confirmation.landlord.sign = body.confirmation.landlord.sign;
											agreement.inventory_list.data.confirmation.landlord.date = new Date();
											agreement.inventory_list.data.status = "pending";
											agreement.inventory_list.data.created_at = new Date();
											agreement.inventory_list.data.property = propertyId;
											agreement.inventory_list.data.lists = body.lists;
											agreement.save((err, saved) => {
												if(err){
													reject(err);
												}
												if(saved){
													let type = "updateInventory";
													Agreements.email(id, type);
													resolve({message: 'update inventory list success'});
												}
											})											
										}
									});
							});							
						}
						if(il.status == "completed"){
							resolve({message: "can not change"})
						}
						if(!il){
							agreement.inventory_list.data.confirmation.landlord.sign = body.confirmation.landlord.sign;
							agreement.inventory_list.data.confirmation.landlord.date = new Date();
							agreement.inventory_list.data.status = "pending";
							agreement.inventory_list.data.created_at = new Date();
							agreement.inventory_list.data.property = propertyId;
							agreement.inventory_list.data.lists = body.lists;
							agreement.save((err, saved) => {
								if(err) {
									reject(err);
								}
								else if(saved) {
									Agreements.notification(id, type_notif);
									let type = "createInventory";
									Agreements.email(id, type);
									resolve({message: 'create inventory list success'});
								}
							})
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

				if (IDUser != tenantId){
					reject ({message: "sorry you can not check this Inventory List"})
				}
				else if(IDUser == tenantId){
					for(var i = 0; i < body.lists.length; i++){
						for(var j = 0; j < agreement.inventory_list.data.lists.length; j++){
							if(agreement.inventory_list.data.lists[j]._id == body.lists[i].idList) {
								for(var k = 0; k < body.lists[i].idItems.length; k++){
									for(var l = 0; l < agreement.inventory_list.data.lists[j].items.length; l++){
										if(body.lists[i].idItems[k] == agreement.inventory_list.data.lists[j].items[l]._id) {
											agreement.inventory_list.data.lists[j].items[l].tenant_check = "true";
											agreement.save((err, result) => {
												if(err) {
													reject(err);
												}
											});	
										}
									}
								}
							}
						}
					}
					agreement.inventory_list.data.confirmation.tenant.sign = body.confirmation.tenant.sign;
					agreement.inventory_list.data.confirmation.tenant.date = new Date();
					agreement.inventory_list.data.status = "completed";
					agreement.save((err, update) => {
						if(err) {
							reject(err);
						}
						else if(update) {
							Agreements.notification(id, type_notif).then(res => {
								let typeEmail = "confirmInventory";
								Agreements.email(id, typeEmail);
								resolve({message: 'success'});
							});		
						}
					});
				}							
			})
	});
});

//create History
agreementsSchema.static('createHistory', (id:string, typeDataa:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
    	let data = "";
        Agreements
          .findById(id, typeDataa, (err, result) => {
          	if (typeDataa == "letter_of_intent"){
            	data = result.letter_of_intent.data;
            }
            if (typeDataa == "tenancy_agreement"){
            	data = result.tenancy_agreement.data;
            }
            if (typeDataa == "inventory_list"){
            	data = result.inventory_list.data;
            }
            
            var historyObj = {$push: {}};  
            historyObj.$push[typeDataa+'.histories'] = {"date": new Date(), "data": data};
            
            Agreements
              .findByIdAndUpdate(id, historyObj)
              .exec((err, saved) => {
                err ? reject(err)
                	: resolve(saved);
              });
          })
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
		let typeData = "";

		let confirmObj = {$set: {}};
		confirmObj.$set[type + ".data.confirmation." + status + ".sign"] = body.sign;
		confirmObj.$set[type + ".data.confirmation." + status + ".date"] = new Date;

		Agreements
			.findByIdAndUpdate(id, confirmObj)
			.exec((err, saved) => {
                err ? reject(err)
                	: resolve(saved);
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

		Agreements
			.findById(id, (err, agreement) => {
				let loiData = agreement.letter_of_intent.data;
				let gfd = loiData.gfd_amount;
				let std = loiData.sd_amount;
				let scd = loiData.security_deposit;

				if(type == "letter_of_intent"){
					paymentFee = [{
						"code_name": "std",
						"name": "Stamp Duty",
						"amount": std, 
						"needed_refund": false, 
						"refunded": false,
						"created_at": new Date()
					},
					{
						"code_name": "gfd",
						"name": "Good Faith Deposit",
						"amount": gfd, 
						"needed_refund": false, 
						"refunded": false,
						"created_at": new Date()
					}];
					paymentType = "loi";
				}
				else if (type ==  "tenancy_agreement"){
					paymentFee = [{
						"code_name": "scd",
						"name": "Security Deposit",
						"amount": scd, 
						"needed_refund": false, 
						"refunded": false,
						"created_at": new Date()
					}];
					paymentType = "ta";
				}
				var _payment = new Payments();
				_payment.type = paymentType;
				_payment.fee = paymentFee;
				_payment.attachment.payment = body.attachment;
				_payment.status = "pending";
				_payment.save();	

				var paymentId = _payment._id;
				if(type == "letter_of_intent"){
					payObj.$set["letter_of_intent.data.payment"] = paymentId;
				}
				else if (type ==  "tenancy_agreement"){
					payObj.$set["tenancy_agreement.data.payment"] = paymentId;
				}

				Agreements
					.findByIdAndUpdate(id, payObj)
					.exec((err, updated) => {
			      		err ? reject(err)
			      			: resolve(updated);
			      	});	
			})		
	});
});

agreementsSchema.static('feeUpdate', (data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		var ObjectID = mongoose.Types.ObjectId;	
		var body:any = data;

		if (body.typeInput == "loi"){
			Payments
				.update({"_id": body.paymentID, "fee": {$elemMatch: {"_id": new ObjectID(body.idStd)}}}, {
					$set: {
						"fee.$.received_amount": body.receivePaymentStd,
						"fee.$.needed_refund": false,
						"fee.$.refunded": false,
						"fee.$.updated_at": new Date(),
						"attachment.payment_confirm": body.payment_confirm,
						"status": body.status
					}
				})
				.exec((err, updated) => {
		      		err ? reject(err)
		      			: resolve(updated);
		      	});	

			Payments
				.update({"_id":body.paymentID, "fee": {$elemMatch: {"_id": new ObjectID(body.idGfd)}}}, {
					$set: {
						"fee.$.received_amount": body.receivePaymentGfd,
						"fee.$.needed_refund": false,
						"fee.$.refunded": false,
						"fee.$.updated_at": new Date(),
						"attachment.payment_confirm": body.payment_confirm,
						"status": body.status
					}
				})
				.exec((err, updated) => {
		      		err ? reject(err)
		      			: resolve(updated);
		      	});
		}
		
		if(body.typeInput == "ta"){
			Payments
				.update({"_id":body.paymentID, "fee": {$elemMatch: {"_id": new ObjectID(body.idScd)}}}, {
					$set: {
						"fee.$.received_amount": body.receivePaymentScd,
						"fee.$.needed_refund": false,
						"fee.$.refunded": false,
						"fee.$.updated_at": new Date(),
						"attachment.payment_confirm": body.payment_confirm,
						"status": body.status
					}
				})
				.exec((err, updated) => {
		      		err ? reject(err)
		      			: resolve(updated);
		      	});
		}		    	
	});
});

agreementsSchema.static('addRefund', (data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
			
		var body:any = data;

		Payments
			.update({"_id":body.paymentID}, {
				$push: {
					"fee":{
						"code_name": "mmr",
						"name": "refund",
						"created_at": new Date(),
						"received_amount": body.refundPayment,
						"needed_refund": true,
						"refunded": false
					}
				}
			})
			.exec((err, updated) => {
	      		err ? reject(err)
	      			: resolve(updated);
	      	});
	});
});

agreementsSchema.static('paymentConfirmedLoi', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		Agreements
			.findById(id)
			.exec((err, agreement) => {
				if(err){
					reject(err)
				}
				else if (agreement){
					agreement.letter_of_intent.data.status = "payment-confirmed";
					agreement.save((err, saved) => {
						if(err){
							reject(err);
						}
						else if(saved){
							resolve(saved);
						}
					})
				}
			})		
	});
});

agreementsSchema.static('acceptPayment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		var ObjectID = mongoose.Types.ObjectId;
		let body:any = data;
		let type:any = body.type;
		let receive_payment = body.receive_payment;
		let paymentID;
		let feeStd;
		let feeGfd;
		let feeScd;
		let idStd;
		let idGfd;
		let idScd;
		let feeData;
		let receivePaymentStd;
		let receivePaymentGfd;
		let receivePaymentScd;
		let refundPayment;
		let reducePaymentStd;
		let reducePaymentGfd;
		let reducePaymentScd;
		let totalFee;
		let totalReceive;

	    Agreements
			.findById(id, (err, agreement) => {
				let loiData = agreement.letter_of_intent.data;
				let taData = agreement.tenancy_agreement.data;
				let landlordId = agreement.landlord;
				let gfd = loiData.gfd_amount;
				let std = loiData.sd_amount;
				let scd = loiData.security_deposit;

				if (type == "letter_of_intent"){
					agreement.letter_of_intent.data.status = "payment-confirmed";
					paymentID = loiData.payment;
					totalFee = std + gfd;
					totalReceive = receive_payment;
					Payments
						.findOne({"_id": paymentID})
						.select({"fee": {$elemMatch: {"code_name": "std"}}})
						.exec((err, payment) => {
							if(payment){
								let fee1 = [].concat(payment.fee);
								for(var i = 0; i < fee1.length; i++ ){
									let _fee1 = fee1[i];
									feeStd = _fee1.amount;
									idStd = _fee1._id;
								}
							}
							Payments
								.findOne({"_id": paymentID})
								.select({"fee": {$elemMatch: {"code_name": "gfd"}}})
								.exec((err, paymentt) => {
									if(paymentt){
										let fee2 = [].concat(paymentt.fee);
										for(var j = 0; j < fee2.length; j++ ){
											let _fee2 = fee2[j];
											feeGfd = _fee2.amount;
											idGfd = _fee2._id;
										}
									}
									if (feeGfd <= feeStd){
										receivePaymentGfd = feeGfd;
										reducePaymentGfd = receive_payment - receivePaymentGfd;
										reducePaymentStd = feeStd - reducePaymentGfd;
										if (reducePaymentStd >= 1){
											receivePaymentStd = feeStd;
											refundPayment = reducePaymentGfd - receivePaymentStd;
										}
									}
									else{
										receivePaymentStd = feeStd;
										reducePaymentStd = receive_payment - receivePaymentStd;
										reducePaymentGfd = reducePaymentStd - feeGfd; 
										if (reducePaymentGfd >= 1){
											receivePaymentGfd = feeGfd;
											refundPayment = reducePaymentStd - receivePaymentGfd;
										}
									}
									var data ={
										"paymentID": paymentID,
										"idStd": idStd,
										"idGfd": idGfd,									
										"receivePaymentStd": receivePaymentStd,
										"receivePaymentGfd": receivePaymentGfd,
										"payment_confirm": body.payment_confirm,
										"refundPayment": refundPayment,
										"typeInput": "loi",
										"status": "accepted"
									}					
									if(totalReceive - totalFee == 0)
									{	
										Agreements.feeUpdate(data).then(res => {
											Agreements.paymentConfirmedLoi(id);
											let typeMail = "acceptLoiPayment";
											Agreements.email(id, typeMail).then(res => {
												resolve({message: "success"});
											})								
										});									
									}
									if (totalReceive - totalFee >= 1){									
										Agreements.feeUpdate(data).then (res => {
											Agreements.addRefund(data).then (res => {
												Agreements.paymentConfirmedLoi(id);
												let typeMail = "acceptLoiPayment";
												Agreements.email(id, typeMail).then(res => {
													resolve({message: "success"});
												})
											});											
										});	
									}
								});															
						});
				}
				if (type == "tenancy_agreement"){
					agreement.tenancy_agreement.data.status = "accepted";
					paymentID = taData.payment;
					totalFee = scd;
					totalReceive = receive_payment;
					Payments
						.findOne({"_id": paymentID})
						.select({"fee": {$elemMatch: {"code_name": "scd"}}})
						.exec((err, paymenttt) => {
							let fee3 = [].concat(paymenttt.fee);
							for(var k = 0; k < fee3.length; k++ ){
								let _fee3 = fee3[k];
								feeScd = _fee3.amount;
								idScd = _fee3._id;
							}
							if (feeScd != 0){
								receivePaymentScd = feeScd;
								reducePaymentScd = receive_payment - receivePaymentScd;
								if (reducePaymentScd >= 1){
									refundPayment = reducePaymentScd;
								}
							}
							var data ={
								"paymentID": paymentID,
								"idScd": idScd,
								"receivePaymentScd": receivePaymentScd,
								"payment_confirm": body.payment_confirm,
								"refundPayment": refundPayment,
								"typeInput": "ta",
								"status": "accepted"
							}					
							if(totalReceive - totalFee == 0)
							{	
								Agreements.feeUpdate(data).then(res => {
									let typeMail = "acceptTaPayment";
									Agreements.email(id, typeMail).then(res => {
										resolve({message: "success"});
									})
								});									
							}
							if (totalReceive - totalFee >= 1){									
								Agreements.feeUpdate(data).then(res => {
									Agreements.addRefund(data);	
									let typeMail = "acceptTaPayment";
									Agreements.email(id, typeMail).then(res => {
										resolve({message: "success"});
									})
								});																			
							}
						});	
				}
				agreement.save((err, saved) => {
		      		err ? reject(err)
		      			: resolve(saved);
		      	});				
			})
	});
});

agreementsSchema.static('feeNeededRefund', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Payments
			.findById(id, (err, payments) => {
				if(payments) {
					for(var i = 0; i < payments.fee.length; i++){
						Payments
							.update({"_id": id, "fee":{ $elemMatch: {"needed_refund": false}}}, {
								$set: {
									"fee.$.needed_refund": true,
									"fee.$.updated_at": new Date()
								},
							}, {multi: true})
							.exec((err, update) => {
				              err ? reject(err)
				            	  : resolve(update);
				            });			
					}
				}
			})
	});
});

agreementsSchema.static('rejectPayment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		let body:any = data;
		let type:any = body.type;
		let paymentID;
		let type_notif = "rejectLoi";
		
	    Agreements
			.findById(id, (err, agreement) => {
				let loiData = agreement.letter_of_intent.data;
				let taData = agreement.tenancy_agreement.data;

				if (type == "letter_of_intent"){
					paymentID = loiData.payment.toString();					
					Agreements.feeNeededRefund(paymentID).then(res =>{
						agreement.letter_of_intent.data.status = "rejected";
						agreement.save((err, saved) => {
							Payments
								.update({"_id": id}, {
									$set:{
										"status": "rejected",
										"remarks": body.remarks
									}
								})
								.exec((err, updated) => {
									if(err){
										reject(err)
									}
									else if(updated){
										let typeMail = "rejectLoiPayment";
										Agreements.email(id, typeMail).then(res => {
											Agreements.notification(id, type_notif);
											resolve({status: saved.letter_of_intent.data.status});
										})
									}
								})						
				      	});	
					});
				}
				if (type == "tenancy_agreement"){
					agreement.tenancy_agreement.data.status = "rejected";
					paymentID = taData.payment;
					Agreements.feeNeededRefund(paymentID).then(res =>{
						agreement.letter_of_intent.data.status = "rejected";
						agreement.save((err, saved) => {
				      		let typeMail = "rejectTaPayment";
							Agreements.email(id, typeMail).then(res => {
								Agreements.notification(id, type_notif);
								resolve({status: saved.tenancy_agreement.data.status});
							})
				      	});	
					});
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
				if(payments) {
					for(var i = 0; i < payments.fee.length; i++){
						let refunded = payments.fee[i].refunded;
						let fee = 0;
						if (refunded == false){
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
				if(payments) {
					for(var i = 0; i < payments.fee.length; i++){
						let refunded = payments.fee[i].refunded;
						Payments
							.update({"_id": id, "fee":{ $elemMatch: {"needed_refund": false}}}, {
								$set: {
									"fee.$.refunded": true,
									"fee.$.updated_at": new Date(),
									"attachment.refund_confirm": body.refund_confirm
								},
							}, {multi: true})
							.exec((err, update) => {
				              err ? reject(err)
				            	  : resolve(update);
				            });									
					}
					resolve({"refund" : "success"})
				}
				resolve({"refund" : "no need refund"})
			})
	});
});

//notification
agreementsSchema.static('notification', (id:string, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

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
			            	if(type == "initiateLoi"){
								message = "Letter of Intent (LOI) received for" + unit + " " + devResult.name;
								type_notif = "received_LOI";
								user = landlordId;
							}
			            	if(type == "rejectLoi"){
								message = "Letter of Intent (LOI) rejected for" + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
								user = tenantId;
							}
							if(type == "acceptLoi"){
								message = "Letter of Intent (LOI) accepted for" + unit + " " + devResult.name;
								type_notif = "accepted_LOI";
								user = tenantId;
							}
							if(type == "initiateTA"){
								message = "Tenancy Agreement (TA) received for" + unit + " " + devResult.name;
								type_notif = "received_LOI";
								user = landlordId;
							}
			            	if(type == "rejectTA"){
								message = "Tenancy Agreement (TA) rejected for" + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
								user = tenantId;
							}
							if(type == "acceptTA"){
								message = "Tenancy Agreement (TA) accepted for" + unit + " " + devResult.name;
								type_notif = "accepted_LOI";
								user = tenantId;
							}
							if(type == "initiateIL"){
								message = "Inventory List received for" + unit + " " + devResult.name;
								type_notif = "received_LOI";
								user = tenantId;
							}
			            	if(type == "confirmedIL"){
								message = "Inventory List confirmed for" + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
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
			              err ? reject(err)
			              : resolve(update);
			            });
			})
        })		
	});
});

agreementsSchema.static('email', (idAgreement:string, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(idAgreement)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

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
				if(type == 'initiateLoi'){
					mail.initiateLOI(landlordEmail, landlordName, tenantUsername, fulladdress, from);
				}
				if(type == 'acceptedLoiLandlord'){
					mail.acceptedLoiLandlord(tenantEmail, tenantName, landlordUsername, fulladdress, from);
				}
				if(type == 'expiredLoiLandlord'){
					mail.expiredLoiLandlord(tenantEmail, tenantName, fulladdress, from);
				}
				if(type == 'acceptLoiPayment'){
					mail.acceptLoiPayment(tenantEmail, tenantName, fulladdress, by, from);
				}
				if(type == 'rejectLoiPayment'){
					mail.rejectLoiPayment(tenantEmail, tenantName, fulladdress, by, from);
				}
				if(type == 'rejectLoiLandlord'){
					mail.rejectLoiLandlord(tenantEmail, tenantName, landlordUsername, fulladdress, by, from);
				}
				if(type == 'rejectLoiAdmin'){
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.rejectLoiAdmin(email, fullname, fulladdress, from);
				}
				if(type == 'initiateTaLandlord'){
					mail.initiateTaLandlord(tenantEmail, tenantName, landlordUsername, fulladdress, from);
				}
				if(type == 'initiateTaTenant'){
					mail.initiateTaLandlord(landlordEmail, landlordName, tenantUsername, fulladdress, from);
				}
				if(type == 'acceptTa'){
					mail.acceptTa(tenantEmail, tenantName, fulladdress, landlordUsername, from);
				}
				if(type == 'expiredTa'){
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.expiredTa(email, fullname, fulladdress, from);
				}
				if(type == 'expiredLoi'){
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.expiredLoi(email, fullname, fulladdress, from);
				}
				if(type == 'acceptTaPayment'){
					mail.acceptTaPayment(tenantEmail, tenantName, fulladdress, by, from);
				}
				if(type == 'rejectTaPayment'){
					mail.rejectTaPayment(tenantEmail, tenantName, fulladdress, by, from);
				}
				if(type == 'rejectTa'){
					mail.rejectTa(tenantEmail, tenantName, fulladdress, by, tenantplace, from);
				}
				if(type == 'rejectTaAdmin'){
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.rejectLoiAdmin(email, fullname, fulladdress, from);
				}
				if(type == 'stampCertificateTa'){
					let email = [tenantEmail, landlordEmail];
					let fullname = [tenantName, landlordName];
					mail.stampCertificateTa(email, fullname, fulladdress, by, from);
				}				
				if(type == 'createInventory'){
					mail.createInventory(tenantEmail, tenantUsername, landlordUsername, fulladdress, from);
				}
				if(type == 'updateInventory'){
					mail.updateInventory(tenantEmail, tenantUsername, landlordUsername, fulladdress, from);
				}
				if(type == 'confirmInventory'){
					mail.confirmInventory(landlordEmail, tenantUsername, landlordUsername, fulladdress, from);
				}
			})		
	});
});

let Agreements = mongoose.model('Agreements', agreementsSchema);

export default Agreements;