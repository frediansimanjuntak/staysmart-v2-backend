import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
// import * as newrelic from 'newrelic';
import agreementsSchema from '../model/agreements-model';
import Users from '../../users/dao/users-dao';
import Payments from '../../payments/dao/payments-dao';
import Attachments from '../../attachments/dao/attachments-dao';
import Appointments from '../../appointments/dao/appointments-dao';
import Developments from '../../developments/dao/developments-dao';
import Notifications from '../../notifications/dao/notifications-dao';
import Properties from '../../properties/dao/properties-dao';
import {mail} from '../../../../email/mail';

agreementsSchema.static('getAgreement', (query:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements
			.find(query)
			.populate("property letter_of_intent.data.property letter_of_intent.data.appointment inventory_list.data.lists.items.attachments tenancy_agreement.data.stamp_certificate room_id letter_of_intent.data.tenant.identification_proof.front letter_of_intent.data.tenant.identification_proof.back letter_of_intent.data.landlord.identification_proof.front letter_of_intent.data.landlord.identification_proof.back")
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
				err ? reject({message: err.message})
					: resolve(agreements);
			});
	});
});

agreementsSchema.static('getAllAgreement', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {};
		Agreements.getAgreement(_query).then(res => {
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
		Agreements.getAgreement(_query).then(res => {
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
		Agreements.getAgreement(_query).then(res => {
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
		Agreements.getAgreement(_query).then(res => {
			_.each(res, (result) => {
				if(result.landlord._id == IDUser || result.tenant._id == IDUser || role == "admin"){
					resolve(result);
				}
				else{
					reject({message:"forbidden"});
				}
			})		
		})
		.catch(err => {
			reject({message: err.message});
		})
	});
});

agreementsSchema.static('getAllHistory', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {$and: [{"letter_of_intent.data.status": "accepted"},{"tenancy_agreement.data.status": "accepted"}]};
		Agreements.getAgreement(_query).then(res => {
			resolve(res);
		})
		.catch(err => {
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
				if(err){
					reject(err);
				}
				if(res){
					var taDocs = res;
					var savedComission = 12100;
					_.each(taDocs, function(ta) {					
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
						else{
							savedComission = savedComission;
						}
					});
					resolve({odometer: savedComission});
				}
			})
	});
});

agreementsSchema.static('createAgreements', (agreements:Object, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}
		let body:any = agreements;
		let IDUser = userId.toString();
		if(!body.property) {
			reject({message: 'no property id'});
		}
		else{
			Properties
				.findById(body.property)
				.exec((err, properties) => {
					if(err){
						reject({message: err.message});
					}
					if(properties){
						let propertyId = properties._id;
						let propertyStatus = properties.status;
						let landlordId = properties.owner.user;
						if(landlordId == userId){
							resolve({message: "You can not create agreement with your owned property"});
						}
						if(landlordId != userId){
							Agreements
								.findOne({"property": body.property, "tenant": userId})
								.exec((err, agreement) => {
									if(err){
										reject({message: err.message});
									}
									if(agreement){
										let roomId;
										if(agreement.room_id){
											roomId = agreement.room_id;
										}
										resolve({_id: agreement._id, room_id: roomId, message: "agreement has been made"})
									}
									else{
										if(propertyStatus == "published" || propertyStatus == "initiated"){
											var _agreements = new Agreements(agreements);
											_agreements.property = propertyId;
											_agreements.tenant =  userId;
											_agreements.landlord = landlordId;
											if(body.appointment) {
												_agreements.appointment = body.appointment;
											}
											if(body.room_id){
												_agreements.room_id = body.room_id;
											}
											_agreements.save((err, saved)=>{
												err ? reject({message: err})
													: resolve({_id: saved._id});
											});
										}
										if(propertyStatus == "rented"){
											reject({message: "this property has rented"})
										}
										else{
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
agreementsSchema.static('getLoi', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let _query = {"_id": id};
		Agreements.getAgreement(_query).then(res => {
			if(res){
				_.each(res, (result) => {
					if(result.landlord._id == IDUser || result.tenant._id == IDUser || role == "admin"){
						resolve(result.letter_of_intent.data);
					}
					else{
						reject({message:"forbidden"});
					}
				})				 
			}
			else{
				reject({message: "error"});
			}
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
				if(err){
					reject({message: err.message});
				}
				else{
					let agreementId = appointment.agreement;
					let statusAppointment = appointment.status;
					Agreements
						.findById(agreementId)
						.exec((err, agreement) => {
							if(err){
								reject({message: err.message});
							}
							if(agreement){
								agreement.appointment = id;
								agreement.save((err, saved) => {
									if(err){
										reject({message: err.message});
									}
									if(saved){
										if(statusAppointment == "archived"){
											if(saved.appointment == id.toString() && agreement._id == agreementId.toString()){
												let statusLoi = agreement.letter_of_intent.data.status;
												if(statusLoi  == "rejected" || statusLoi == "expired"){
													resolve({message: "create Loi"});
												}
												else{
													Agreements.getLoi(agreementId.toString(), userId).then(res => {
														if(res.created_at){
															resolve({message: "forbidden"});
														}
														else{
															resolve({message: "create Loi"});
														}
													})
													.catch((err) => {
														reject(err);
													})
												}
											}
											else{
												reject({message: "forbidden"});
											}
										}
										else{
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
						if(loi.created_at || loi.status == "rejected" || loi.status == "expired"){
							Agreements.createHistory(id, typeDataa);
							Agreements
								.findByIdAndUpdate(id, {
									$unset: {
										"letter_of_intent.data": ""
									}
								})
								.exec((err, updated) => {
									if(err){
										reject({message: err.message});
									}
								});
						}
						if(!tenantData.name){
							Agreements.userUpdateDataTenant(tenantID, tenant);
						}
						Users
							.findOne({"_id": tenantID, "tenant.data.bank_account.no": inputBankNo})
							.exec((err, user) => {
								if(err){
									reject(err);
								}
								if(user){
									Agreements.userUpdateDataTenant(tenantID, tenant)
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
						loiObj.$set["letter_of_intent.data.term_lease_extend"] = 0;
						loiObj.$set["letter_of_intent.data.lapse_offer"] = 0;
						loiObj.$set["letter_of_intent.data.minor_repair_cost"] = 0;
					    loiObj.$set["letter_of_intent.data.security_deposit"] = security_deposit;
					    loiObj.$set["letter_of_intent.data.landlord"] = landlordData;
					    loiObj.$set["letter_of_intent.data.status"] = "draft";
					    loiObj.$set["letter_of_intent.data.created_at"] = new Date();
					    loiObj.$set["letter_of_intent.data.property"] = propertyID;
					    if(agreement.appointment){
							appointmentID = agreement.appointment._id;
							loiObj.$set["letter_of_intent.data.appointment"] = appointmentID;
						}

						Agreements
							.update(_query, loiObj)
							.exec((err, updated) => {
								err ? reject({message: err.message})
									: resolve({message: "Loi created"});
							});				
					}
				}
				else if (err){
					reject({message: err.message});
				}	
			})		
	});
});

agreementsSchema.static('userUpdateDataTenant', (id:string, data:Object,):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		let body:any = data;
		Users
			.findById(id)
			.exec((err, res) => {
				if(err){
					reject(err);
				}
				if(res){
					if(res.tenant.data.name){
						let tenantData = res.tenant.data;
						Agreements.historyDataTenant(id, tenantData);
					}
					res.tenant.data = body.tenant;
					res.save((err, saved) => {
						err ? reject({message: err.message})
            				: resolve(saved);
					})
				}
			})		
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
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		Agreements
			.findById(id)
			.populate("landlord tenant property appointment letter_of_intent.data.payment")
			.exec((err, agreement) => {
				if(err){
					reject({message: err.message});
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
								reject({message: err.message});
							}
							if(saved){
								if(agreement.appointment){
									Appointments
										.findById(agreement.appointment._id)
										.exec((err, res) => {
											if(err){
												reject({message: err.message});
											}
											if(res){
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
										if(err){
											reject({message: err.message})
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
				let landlordId
				if(agreement.landlord){
					landlordId = agreement.landlord._id;
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
				}	
				else{
					resolve({message: "forbidden"});
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
				if(err){
					reject({message: err.message});
				}
				else if(agreement){
					let landlordID = agreement.landlord._id;
					if(landlordID != IDUser){
						resolve({message: "forbidden"});
					}
					else if(landlordID == IDUser || role == 'admin'){
						let payment = agreement.letter_of_intent.data.payment;
						let statusLoi = agreement.letter_of_intent.data.status;
						let paymentId = payment._id;
						let paymentStatus = payment.status;
						let paymentFee = payment.fee;
						if(paymentStatus == "rejected"){
							resolve({message: "this payment has rejected"});
						}

						if(paymentStatus == "pending" || paymentStatus == "accepted" || statusLoi == "payment-confirmed"){
							Payments
								.update({"_id": paymentId, "fee":{ $elemMatch: {"needed_refund": false}}}, {
									$set: {
										"fee.$.needed_refund": true,
										"fee.$.updated_at": new Date(),
										"remarks": body.reason,
										"status": "rejected"
									},
								}, {multi: true})
								.exec((err, update) => {
				            	if(err){
				            		reject({message: err.message});
				            	}
				            });			
							agreement.letter_of_intent.data.status = "rejected";
							agreement.save((err, saved)=>{
								if(err){
									reject({message: err.message})
								}
								if (saved){
									let typeMail;
									if(role == 'admin'){
										typeMail = "rejectLoiAdmin";
									}
									if(landlordID == IDUser){
										typeMail = "rejectLoiLandlord";
									}
									Agreements.email(id, typeMail);
									resolve(saved);
								}
							});							
						}
					}						
				}
			})
	});
});

//TA
agreementsSchema.static('getTA', (id:string, userId:string, role:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let _query = {"_id": id};
		Agreements.getAgreement(_query).then(res => {
			if(res){
				_.each(res, (result) => {
					if(result.landlord._id == IDUser || result.tenant._id == IDUser || role == "admin"){
						resolve(result.tenancy_agreement.data);
					}
					else{
						reject({message:"forbidden"});
					}
				})				 
			}
			else{
				reject({message: "error"});
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
		console.log(body);

		let type = "tenancy_agreement";
		let bankNo = body.no;
		let IDUser = userId.toString();
		Agreements
			.findById(id)
			.populate("landlord tenant property")
			.exec((err, agreement) => {				
				if(err){
					reject({message: err.message})
				}
				else if(agreement){
					let landlordId = agreement.landlord._id;
					let landlordDataBank = agreement.landlord.landlord.data.bank_account;
					let ta = agreement.tenancy_agreement.data;
					if (landlordId != IDUser){
						resolve({message: "forbidden"});
					}
					else if(landlordId == IDUser){
						if(ta.created_at || ta.status == "rejected" || ta.status == "expired"){
							Agreements.createHistory(id, type);
							Agreements
								.findByIdAndUpdate(id, {
									$unset: {
										"tenancy_agreement.data": ""
									}
								})
								.exec((err, updated) => {
									if(err){
										reject({message: err.message});
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
										reject({message: err.message})
									}
								})
						}
						agreement.letter_of_intent.data.landlord.bank_account.no = body.no;
						agreement.letter_of_intent.data.landlord.bank_account.name = body.name;
						agreement.letter_of_intent.data.landlord.bank_account.bank = body.bank;	
						agreement.tenancy_agreement.data.status = "pending";
						agreement.tenancy_agreement.data.created_at = new Date();
						agreement.save((err, saved)=>{
							err ? reject({message: err.message})
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
			.populate("landlord tenant appointment property")
			.exec((err, agreement) => {
				if(err){
					reject({message: err.message});
				}
				else if(agreement){
					let propertyId = agreement.property._id;
					let landlordId = agreement.landlord._id;
					if(landlordId != IDUser){
						reject({message:"forbidden"});
					}
					else if(landlordId == IDUser){
						if(agreement.appointment){
							Appointments
								.findById(agreement.appointment._id)
								.exec((err, res) => {
									if(err){
										reject({message: err.message});
									}
									if(res){
										res.state = "initiate tenancy agreement";
										res.save((err, saved) => {
											err ? reject({message: err.message})
												: resolve(saved);
										});
									}
								})
						}
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

agreementsSchema.static('updatePropertyStatus', (id:string, status:string, agreement:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Properties
			.findById(id)
			.exec((err, property) => {
				if(err){
					reject(err);
				}
				if(property){
					if(property.agreements.data){
						property.agreements.history.push({"date": new Date(), "data": property.agreements.data});
					}
					property.status = status;
					property.agreements.data = agreement;
					property.save((err, saved) => {
						err ? reject({message: err.message})
							: resolve(saved);
					});
				}
			})
	});
});

agreementsSchema.static('updateUserRented', (id:string, until:string, property:string, agreement:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Users
			.findById(id)
			.exec((err, user) => {
				if(err){
					reject(err);
				}
				if(user){
					user.rented_properties.push({"until": until, "property": property, "agreement": agreement});
					user.save((err, saved) => {
						err ? reject({message: err.message})
							: resolve(saved);
					});
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
					let propertyId = agreement.property._id.toString();
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
						Agreements.updatePropertyStatus(propertyId, "rented", id.toString());
						Agreements.updateUserRented(propertyId, until, propertyId, id.toString());						
						agreement.tenancy_agreement.data.status = "admin-confirmation";
						agreement.tenancy_agreement.data.created_at = new Date();
						agreement.save((err, saved)=>{
							if(err){
								reject({message: err.message});
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

agreementsSchema.static('rejectTA', (id:string, userId:string, role:string, ta:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let IDUser = userId.toString();
		let body:any = ta;

		Agreements
			.findById(id)
			.populate("room_id landlord tenant property appointment")
			.exec((err, agreement) => {
				if(err){
					reject({message: err.message});
				}
				if(agreement){
					let landlordId = agreement.landlord._id;
					let tenantId = agreement.tenant._id.toString();

					if(tenantId != IDUser){
						reject({message:"forbidden"});
					}
					if(tenantId == IDUser || role == "admin"){
						let loi = agreement.letter_of_intent.data;
						let ta = agreement.tenancy_agreement.data;
						let paymentIdLoi = loi.payment;	
						if(loi.status == "accepted" || ta.status == "pending"){
							Agreements.penaltyPayment(paymentIdLoi, body.remarks);										
							agreement.tenancy_agreement.data.status = "rejected";
							agreement.letter_of_intent.data.status = "rejected";
							agreement.save((err, saved) => {
								if(err){
									reject({message: err.message});
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
						else{
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
				if(err){
					reject({message: err.message});
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
								agreement.inventory_list.data.lists = body.lists;
								agreement.inventory_list.data.created_at = new Date();	
								agreement.save((err, saved) => {
									if(err){
										reject({message: err.message});
									}
									if(saved){
										let type = "updateInventory";
										Agreements.email(id, type);
										resolve({message: 'update inventory list success'});
									}
								});								
							});							
						}
						if(il.status == "completed"){
							resolve({message: "can not change"})
						}
						if(!il.status){
							agreement.inventory_list.data.confirmation.landlord.sign = body.sign;
							agreement.inventory_list.data.confirmation.landlord.date = new Date();
							agreement.inventory_list.data.status = "pending";
							agreement.inventory_list.data.created_at = new Date();
							agreement.inventory_list.data.property = propertyId;
							agreement.inventory_list.data.lists = body.lists;
							agreement.save((err, saved) => {
								if(err) {
									reject({message: err.message});
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

				if (tenantId != IDUser){
					reject ({message: "sorry you can not check this Inventory List"})
				}
				else if(tenantId == IDUser){
					for(var i = 0; i < body.lists.length; i++){
						for(var j = 0; j < agreement.inventory_list.data.lists.length; j++){
							if(agreement.inventory_list.data.lists[j]._id == body.lists[i].idList) {
								for(var k = 0; k < body.lists[i].idItems.length; k++){
									for(var l = 0; l < agreement.inventory_list.data.lists[j].items.length; l++){
										if(body.lists[i].idItems[k] == agreement.inventory_list.data.lists[j].items[l]._id) {
											agreement.inventory_list.data.lists[j].items[l].tenant_check = "true";
											agreement.save((err, result) => {
												if(err) {
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
						if(err) {
							reject({message: err.message});
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
                err ? reject({message: err.message})
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
                err ? reject({message: err.message})
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
		console.log(body);

		Agreements
			.findById(id)
			.exec((err, agreement) => {
				if(err){
					reject(err);
				}
				if(agreement){
					let loiData = agreement.letter_of_intent.data;
					let taData = agreement.tenancy_agreement.data;
					let gfd = loiData.gfd_amount;
					let std = loiData.sd_amount;
					let scd = loiData.security_deposit;
							
					if(type == "letter_of_intent"){
						if(loiData.payment){
							resolve({message: "Already Payment"});									
						}
						if(!loiData.payment){
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
					if (type ==  "tenancy_agreement"){
						if(taData.payment){
							resolve({message: "Already Payment"});
						}
						if(!taData.payment){
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
					_payment.needed_refund = false;
					_payment.refunded = false;
					_payment.attachment.payment = body.attachment;
					_payment.status = "pending";
					_payment.created_at = new Date();
					_payment.save((err, saved)=>{
						if(err){
							reject(err);
						}
						if(saved){
							var paymentId = saved._id;
							if (type ==  "tenancy_agreement"){
								agreement.tenancy_agreement.data.payment = paymentId;
							}
							if(type == "letter_of_intent"){
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
				if(err){
					reject(err)
				}
				if(res){
					if(res.status == "rejected" || res.status == "accepted"){
						resolve({message: "Allready Accept or Reject this Payment"});
					}
					if(res.status == "pending"){
						resolve(res);
					}					
				}
			})
	});
});

agreementsSchema.static('paymentReceiveAmount', (id:string, code:string, receiveAmount:number, neededRefund:boolean, payment_confirm:string, status:string, remarks:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Payments
			.update({"_id": id, "fee": {$elemMatch: {"code_name": code}}}, {
				$set: {
					"fee.$.received_amount": receiveAmount,
					"fee.$.needed_refund": neededRefund,
					"fee.$.refunded": false,
					"fee.$.updated_at": new Date(),
					"attachment.payment_confirm": payment_confirm,
					"status": status,
					"remarks": remarks
				}
			})
			.exec((err, updated) => {
	      		err ? reject({message: err.message})
	      			: resolve(updated);
	      	});
	});
});

agreementsSchema.static('updateReceivePayment', (data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		var ObjectID = mongoose.Types.ObjectId;	
		var body:any = data;
		console.log(data);
		let idPayment = body.paymentID.toString();
		let neededRefundGfd;
		let neededRefundStd;
		let neededRefundScd;

		if(body.typeInput == "loi"){
			if(body.status == "accepted"){
				neededRefundGfd = false;
				neededRefundStd = false;
			}
			else{
				neededRefundGfd = true;
				neededRefundStd = true;
			}
		}
		if(body.typeInput == "ta"){
			if(body.status == "accepted"){
				neededRefundGfd = false;
				neededRefundStd = false;
				neededRefundScd = false;
			}
			else{
				neededRefundGfd = false;
				neededRefundStd = true;
				neededRefundScd = true;
			}
		}
		//stamp duty payment
		Agreements.paymentReceiveAmount(idPayment, "std", body.receiveAmountStd, neededRefundStd, body.payment_confirm, body.status, body.remarks)
		//gfd payment
		Agreements.paymentReceiveAmount(idPayment, "gfd", body.receiveAmountGfd, neededRefundGfd, body.payment_confirm, body.status, body.remarks)
		//security deposit payment
		Agreements.paymentReceiveAmount(idPayment, "scd", body.receiveAmountScd, neededRefundScd, body.payment_confirm, body.status, body.remarks)

		//refund payment
		if(body.refundPayment){
			Agreements.addRefund(idPayment, body.refundPayment)
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
				if(err){
					reject({message: err.message})
				}
				else if (agreement){
					let loiData = agreement.letter_of_intent.data;
					let taData = agreement.tenancy_agreement.data;
					let landlordId = agreement.landlord;
					let paymentLoiID = loiData.payment.toString();
					let paymentTaID;
					if(taData.payment){
						paymentTaID = taData.payment.toString();
					}					 
					let gfd = loiData.gfd_amount;
					let std = loiData.sd_amount;
					let scd = loiData.security_deposit;
					let receiveGfd;
					let receiveStd;
					let receiveScd;
					let refund;
					let temp;
					if(type == "letter_of_intent"){
						if(loiData.status == "draft"){
							resolve({message: "LOI status is draft"})
						}
						else{
							agreement.letter_of_intent.data.status = body.status_loi;
							Agreements.paymentCekStatus(paymentLoiID).then((res) => {
								if(res.message){
									reject(res);
								}
								else{
									let totalFee = std + gfd;
									if(gfd <= std){
										receiveGfd = gfd;
										temp = receivePayment - receiveGfd;
										if(temp - std > 0){
											receiveStd = std;
											refund = temp - std;
										}
										if(temp - std <= 0){
											receiveStd = temp;
										}
									}
									else{
										receiveStd = std;
										temp = receivePayment - receiveStd;
										if(temp - gfd > 0){
											receiveGfd = gfd;
											refund = temp - gfd;
										}
										if(temp - gfd <= 0){
											receiveGfd = temp;
										}
									}
									if(body.status_payment == "rejected"){
										receiveGfd = 0;
										receiveStd = 0;
									}
									var data ={
										"paymentID": paymentLoiID,								
										"receiveAmountStd": receiveStd,
										"receiveAmountGfd": receiveGfd,
										"payment_confirm": body.payment_confirm,
										"refundPayment": refund,
										"typeInput": "loi",
										"status": body.status_payment,
										"remarks": body.remarks
									};						

									if(body.status_payment == "accepted"){
										if(receivePayment >= totalFee){
											Agreements.updateReceivePayment(data);
											Agreements.notification(id, type_notif);										
											Agreements.email(id, typeMail);
										}
										else{
											resolve({message: "cannot process this payment, because your payment less than payment LOI"})
										}
									}
									if(body.status_payment == "rejected"){
										Agreements.updateReceivePayment(data);
										Agreements.notification(id, type_notif);										
										Agreements.email(id, typeMail);
									}									
								}
							})
							.catch((err) => {
								reject(err);
							})
						}
						
					}
					if(type == "tenancy_agreement"){
						if(taData.status == "draft"){
							resolve({message: "TA status is draft"})
						}
						else{
							agreement.tenancy_agreement.data.status = body.status_ta;
							Agreements.paymentCekStatus(paymentTaID).then((res) => {
								if(res.message){
									resolve(res);
								}
								else{
									let totalFee = scd;
									if (scd != 0){
										receiveScd = scd;
										temp = receivePayment - receiveScd;
										if (temp > 0){
											refund = temp;
										}
									}

									if(body.status_payment == "rejected"){
										receiveScd = 0;
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

									if(body.status_payment == "accepted"){
										if(receivePayment >= totalFee){
											Agreements.updateReceivePayment(data);
											Agreements.notification(id, type_notif);										
											Agreements.email(id, typeMail);
										}
										else{
											resolve({message: "cannot process this payment, because your payment less than payment TA"})
										}
									}
									if(body.status_payment == "rejected"){
										Agreements.penaltyPayment(paymentLoiID, body.remarks);
										Agreements.penaltyPayment(paymentTaID, body.remarks);
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
		console.log(body);
		if(type == "letter_of_intent"){
			typeMail = "acceptLoiPayment";
			type_notif = "acceptLoiPayment";
			statusLoi = "payment-confirmed";
		}
		if (type == "tenancy_agreement"){
			typeMail = "acceptTaPayment";
			type_notif = "acceptTaPayment";
			statusTa = "accepted";
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
			reject(err);
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
		console.log(body);
		if(type == "letter_of_intent"){
			typeMail = "rejectLoiPayment";
			type_notif = "rejectLoiPayment";
			statusLoi = "rejected";
		}
		if (type == "tenancy_agreement"){
			typeMail = "rejectTaPayment";
			type_notif = "rejectTaPayment";
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
			reject(err);
		})
	});
});

agreementsSchema.static('penaltyPayment', (idPayment:string, remarks:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Payments
			.findById(idPayment)
			.exec((err, res) => {
				if(err){
					reject(err);
				}
				if(res){
					let fees = res.fee;
					for(var i = 0; i < fees.length; i++){
						let fee = fees[i];
						let idFee = fee._id;
						let codeFee = fee.code_name;
						if (codeFee != "gfd"){
							Payments
								.update({"_id": idPayment, "fee": {$elemMatch: {"_id": idFee}}},{
									$set: {
										"fee.$.needed_refund": true,
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
				if(err){
					reject({message: err.message});
				}
				if(agreement){
					let paymentLoi = agreement.letter_of_intent.data.payment;
					let paymentTa = agreement.tenancy_agreement.data.payment;
					let taStatus = agreement.tenancy_agreement.data.status;

					if(taStatus == "rejected" || taStatus == "expired"){
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
					else{
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
				if(err){
					reject({message: err.message});
				}
				if(agreement){
					let paymentLoi = agreement.letter_of_intent.data.payment;
					let paymentTa = agreement.tenancy_agreement.data.payment;
					let taStatus = agreement.tenancy_agreement.data.status;

					if(taStatus == "accepted"){
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
					else{
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
				if(err){
					reject(err);
				}
				if(res){
					if(res.length == 0){
						resolve(res)
					}
					if(res.length >= 1){
						let dataArr = [];
						for(var i = 0; i < res.length; i++){
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
		                    if (termLease == 6){
		                        feeEarned = 10/100 * (1/4 * monthlyRental);
		                    }
		                    if (termLease == 12){
		                        feeEarned = 10/100 * (1/2 * monthlyRental);
		                    }
		                    if (termLease == 24){
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
		                    if(loi.payment.attachment.payment_confirm){
		                    	transferReferenceLoi = loi.payment.attachment.payment_confirm;
		                    }
		                    let transferReferenceTa;
		                    let attachmentTransferredLandlord;
		                    if(ta.payment.attachment.payment_confirm){
		                    	transferReferenceTa = ta.payment.attachment.payment_confirm;
		                    }
		                    if(loi.payment.transfer_landlord){
		                    	transferredLandlord = loi.payment.transfer_landlord.transfer;
			                    dateTransferredLandlord = loi.payment.transfer_landlord.date_transferred;
			                    if(loi.payment.transfer_landlord.attachment){
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
								user = tenantId;
							}
			            	if(type == "rejectTA"){
								message = "Tenancy Agreement (TA) rejected for" + unit + " " + devResult.name;
								type_notif = "rejected_LOI";
								user = landlordId;
							}
							if(type == "acceptTA"){
								message = "Tenancy Agreement (TA) accepted for" + unit + " " + devResult.name;
								type_notif = "accepted_LOI";
								user = landlordId;
							}
							if(type == "initiateIL"){
								message = "Inventory List received for" + unit + " " + devResult.name;
								type_notif = "received_Inventory";
								user = tenantId;
							}
			            	if(type == "confirmedIL"){
								message = "Inventory List confirmed for" + unit + " " + devResult.name;
								type_notif = "confirm_Inventory";
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