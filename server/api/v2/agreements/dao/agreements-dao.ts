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

agreementsSchema.static('getAll', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {};
		Agreements
			.find(_query)
			.exec((err, agreements) => {
				err ? reject(err)
					: resolve(agreements);
			});
	});
});

agreementsSchema.static('getById', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements
			.findById(id)
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
		Properties
			.findById(body.property, (err, property) => {
				let propertyId = property._id;
				let landlordId = property.owner.user;

				var _agreements = new Agreements({
					"property": propertyId,
					"tenant": userId,
					"landlord": landlordId,
					"appointment": body.appointment
				});		
				_agreements.save((err, saved)=>{
					err ? reject(err)
						: resolve(saved);
				});
			})		
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
					: resolve();
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
agreementsSchema.static('getLoi', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements
			.findById(id)
			.select("letter_of_intent.data")
			.exec((err, agreements) => {
				err ? reject(err)
					: resolve(agreements);
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

		Agreements
			.findById(id, (err, agreement) =>{
				let propertyId = agreement.property;
				let landlordId = agreement.landlord;
				let tenantId = agreement.tenant;
				let loi = agreement.letter_of_intent.data;

				if (tenantId == userId){
					resolve({message: "different user to access LOI"});
				}

				if (loi != null){
					Agreements.createHistory(id, typeDataa);
					Agreements
						.findByIdAndUpdate(id, {
							$unset: {
								"letter_of_intent.data": ""
							}
						})
						.exec((err, updated) => {
							err ? reject(err)
								: resolve(updated);
						});
				}

				//put landlord
				Users
					.findById(landlordId, (err, landlorUser) => {
						let landlordData = landlorUser.landlord.data;
						Users
							.findById(userId, (err, tenantUser) => {
								let tenantData = tenantUser.tenant.data;
								if(!tenantData.name){
									Users
										.findByIdAndUpdate(userId, {
											$set: {
												"tenant.data": body.tenant
											}
										})
										.exec((err, updated) => {
											err ? reject(err)
												: resolve(updated);
										});
								}

								let inputBankNo = body.bank_account.no;
								Users
									.findOne({"_id": tenantId, "tenant.data.bank_account.no": inputBankNo}, (err, user) => {
										if (user == null){
											Users
												.update({"_id": id}, {
													$push:{
														"tenant.data.bank_account": {
															"no": body.bank_account.no,
															"name": body.bank_account.name,
															"bank": body.bank_account.bank
														}
													}
												})
												.exec((err, updated) => {
													err ? reject(err)
														: resolve(updated);
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
							    loiObj.$set["letter_of_intent.data.status"] = "admin-confirmation";
							    loiObj.$set["letter_of_intent.data.created_at"] = new Date();

								Agreements
									.update(_query, loiObj)
									.exec((err, updated) => {
										err ? reject(err)
											: resolve(updated);
										console.log(updated);
									});	
							})
					})
			})
	});
});

agreementsSchema.static('sendLoi', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Agreements
			.findById(id, (err, agreement) => {
				let propertyId = agreement.landlord;
				let type = "initiateLoi";
				Agreements.notifications(id, type);

				Properties
					.findByIdAndUpdate(propertyId, {
						$set: {
							"status": "initiated"
						}
					})
					.exec((err, updated) => {
						err ? reject(err)
							: resolve(updated);
					});	
			})
	});
});

agreementsSchema.static('acceptLoi', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let type_notif = "acceptLoi";
		let type = "letter_of_intent";	
		let status = "accepted";

		Agreements.confirmation(id, data, type).then(res => {
			Agreements.changeStatus(id, status, type).then(res => {
				Agreements.notification(id, type_notif).then(res => {
					resolve(res);
				});
			});
		});		
		
	});
});

agreementsSchema.static('rejectLoi', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let data = {
			"type": "letter_of_intent"
		};
		Agreements.rejectPayment(id, data).then(res =>{
			resolve(res);
		});
	});
});

//TA
agreementsSchema.static('getTA', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements
			.findById(id)
			.select("tenancy_agreement.data")
			.exec((err, agreements) => {
				err ? reject(err)
					: resolve(agreements);
			});
	});
});

agreementsSchema.static('createTA', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		let type = "tenancy_agreement";
		let body:any = data;
		let bankNo = body.no;
		
		Agreements
			.findById(id, (err, agreement) => {
				let lanlordId = agreement.landlord;
				let ta = agreement.tenancy_agreement.data;
				if (ta != null){
					Agreements.createHistory(id, type);
					Agreements
						.findByIdAndUpdate(id, {
							$unset: {
								"tenancy_agreement.data": ""
							}
						})
						.exec((err, updated) => {
							err ? reject(err)
								: resolve(updated);
						});
				}

				Users
					.findOne({"_id": lanlordId, "landlord.data.bank_account.no": bankNo}, (err, user) => {
						if (user == null){
							Users
								.update({"_id": lanlordId}, {
									$push: {
										"landlord.data.bank_account": {
											"no": body.no,
											"name": body.name,
											"bank": body.bank._id
										}
									}
								})
								.exec((err, updated) => {
									err ? reject(err)
										: resolve(updated);
										console.log(updated);
								});
						}
					})						
				agreement.tenancy_agreement.data.status = "admin-confirmation";
				agreement.tenancy_agreement.data.created_at = new Date();
				agreement.save((err, saved)=>{
					err ? reject(err)
						: resolve(saved);
				});
			})		
	});
});

agreementsSchema.static('sendTA', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Agreements
			.findById(id, (err, agreement) => {
				let propertyId = agreement.landlord;
				let type = "initiateTA";
				Agreements.notifications(id, type);				
			})
	});
});

agreementsSchema.static('acceptTA', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let type_notif = "acceptTA";

		Agreements
			.findById(id, (err, agreement)=>{
				let propertyId = agreement.property;
				let tenantID = agreement.tenant;
				let termLease = agreement.letter_of_intent.data.term_lease;
				let termLeaseExtend = agreement.letter_of_intent.data.term_lease_extend;
				let dateCommencement = agreement.letter_of_intent.data.date_commencement;
				let longTerm = termLease + termLeaseExtend;
				let until = dateCommencement + (dateCommencement + longTerm * 30 * 24 * 60 * 60 * 1000) ;
				Properties
					.findByIdAndUpdate(propertyId, {
						$set: {
							"status": "rented"
						}
					})
					.exec((err, updated) => {
						err ? reject(err)
							: resolve();
					});
				Users
					.findByIdAndUpdate(tenantID, {
						$push: {
							"rented_properties": {
								"until": until,
								"property": propertyId,
								"agreement": id
							}
						}
					})
					.exec((err, updated) => {
						err ? reject(err)
							: resolve();
					});

				agreement.tenancy_agreement.data.status = "accepted";
				agreement.tenancy_agreement.data.created_at = new Date();
				agreement.save((err, saved)=>{
					err ? reject(err)
						: resolve({status: "TA "+saved.tenancy_agreement.data.status});
				});
			})			
		Agreements.notification(id, type_notif);
	});
});

agreementsSchema.static('rejectTA', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let data = {
			"type": "tenancy_agreement"
		};
		Agreements.rejectPayment(id, data).then(res =>{
			resolve(res);
		});
	});
});

//inventory list
agreementsSchema.static('getInventoryList', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Agreements
			.findById(id)
			.select("inventory_list.data")
			.exec((err, agreements) => {
				err ? reject(err)
					: resolve(agreements);
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

		Agreements
			.findById(id, (err, agreement) => {
				let landlordId = agreement.landlord;
				let tenantId = agreement.tenant;
				let propertyId = agreement.property;
				let il = agreement.inventory_list.data;
				let typeDataa = "inventory_list";

				if (userId != landlordId){
					reject ({message: "sorry you can not create this Inventory List"})
				}
				else if(userId == landlordId){
					if (il != null){
					Agreements.createHistory(id, typeDataa);
					Agreements
						.findByIdAndUpdate(id, {
							$unset: {
								"inventory_list.data": ""
							}
						})
						.exec((err, updated) => {
							err ? reject(err)
								: resolve(updated);
						});
					}

					Agreements
						.findByIdAndUpdate(id, {
							$set: {
								"inventory_list.data.confirmation.landlord.sign": body.confirmation.landlord.sign,
								"inventory_list.data.confirmation.landlord.date": new Date(),
								"inventory_list.data.status": "pending",
								"inventory_list.data.created_at": new Date(),
								"inventory_list.data.property": propertyId,
								"inventory_list.data.lists": body.lists					
							}	
						})
						.exec((err, updated) => {
							err ? reject(err)
								: resolve({message: "success"});
						});

					Agreements.notification(id, type_notif);
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
		let lists = body.lists;
		let ObjectID = mongoose.Types.ObjectId;
		let type_notif = "confirmedIL";

		Agreements
			.findById(id, (err, agreement) => {
				let landlordId = agreement.landlord;
				let tenantId = agreement.tenant;
				let propertyId = agreement.property;
				let il = agreement.inventory_list.data;
				let typeDataa = "inventory_list";

				if (userId != tenantId){
					reject ({message: "sorry you can not create this Inventory List"})
				}
				else if(userId == tenantId){
					agreement.inventory_list.data.confirmation.tenant.sign = body.confirmation.tenant.sign;
					agreement.inventory_list.data.confirmation.tenant.date = new Date();
					agreement.inventory_list.data.status = "complete";
					agreement.save();

					for(var i = 0; i < lists.lenght; i++){
						let listId = lists[i].idList;
						let itemId = lists[i].idItem;
						Agreements
							.update({"_id": id, "inventory_list.data.lists.item": {$in: {"_id": [itemId]}}},{
								$set: {
									"inventory_list.data.lists.item.$.tenant_check": true
								}
							})
							.exec((err, updated) => {
								err ? reject(err)
									: resolve({message: "success"});
							});
					}	
					Agreements.notification(id, type_notif);
				}							
			})
	});
});
//Inventory List
// agreementsSchema.static('createInventoryList', (id:string, agreements:Object, files:Object):Promise<any> => { 
//   return new Promise((resolve:Function, reject:Function) => { 
// 	    if (!_.isObject(agreements)) { 
// 	      return reject(new TypeError('Agreement is not a valid object.')); 
// 	    } 
// 	    let file:any = files;
// 	    let type = "inventory_list";
// 	    let status = "pending";    

// 	    var statusObj = {$set:{}};
//     	statusObj.$set["inventory_list.data"] = {"status": status, "created_at": new Date()};
//     	Agreements
//     		.findByIdAndUpdate(id, statusObj)
//     		.exec((err,updated) => {
//     			err ? reject(err)
//     				: resolve(updated);
//     		});
// 	    var setlandlordcheck = {$set:{}};
//     	setlandlordcheck.$set['inventory_list.data.lists.0.items.$'] = {"landlord_check": true};
//     	Agreements
//     		.findByIdAndUpdate(id, setlandlordcheck)
//     		.exec((err,updated) => {
//     			err ? reject(err)
//     				: resolve(updated);
//     		});
// 	    Agreements
// 	    	.findByIdAndUpdate(id, agreements)
// 	    	.populate("property")
// 	    	.exec((err,updated) => {
// 	    		err ? reject(err)
// 	    			: resolve(updated);
// 	    	});
//    	});
// }); 

// agreementsSchema.static('updateInventoryList', (id:string, agreements:Object):Promise<any> => {
// 	return new Promise((resolve:Function, reject:Function) => {
// 		if(!_.isObject(agreements)) {
// 			return reject(new TypeError('Agreement is not a valid object.'));
// 		}

// 		let body:any = agreements;
// 		let type = "inventory_list";
// 		let status = "pending";
// 		Agreements.createHistory(id, type);
//     	var setStatusObj = {$set:{}};
//     	setStatusObj.$set["inventory_list.data"] = {"status": status, "created_at": new Date()};
//     	Agreements
//     		.findByIdAndUpdate(id, setStatusObj)
//     		.exec((err,updated) => {
//     			err ? reject(err)
//     				: resolve(updated);
//     		});

// 		for (var h = 0; h < body.lists.length; h++){
// 			var listID = body.lists[h].id;
// 			if (!listID){
// 				Agreements
// 					.update({"_id":id},{
// 						$push: {
// 							"inventory_list.data.lists":body.lists[h]
// 						}
// 					})
// 					.exec((err,updated) => {
// 						err ? reject(err)
// 							: resolve(updated);
// 					});
// 			}
// 			else{
// 				Agreements
// 					.update({"_id": id, "inventory_list.data.lists": {
// 						$elemMatch: {
// 							"_id": body.lists[h].id
// 						}
// 					}}, {
// 						$set: {
// 							"inventory_list.data.lists.$.name":body.lists[h].name,
// 							"inventory_list.data.lists.$.items":body.lists[h].items
// 						}
// 					})
// 					.exec((err,updated) => {
// 						err ? reject(err)
// 							: resolve(updated);
// 					});
// 			}
// 		}		
// 	});		
// });

// agreementsSchema.static('updateTenantCheck', (id:string, agreements:Object):Promise<any> => {
// 	return new Promise((resolve:Function, reject:Function) => {
// 		if(!_.isObject(agreements)) {
// 			return reject(new TypeError('agreement is not a valid object.'));
// 		}
// 		let body:any = agreements;
// 		for (var h = 0; h < body.lists.length; h++){
// 			var listss = body.lists[h];
// 			var listID = listss.id;
// 			for (var i = 0; i < listss.items.length; i++){
// 				var listss_itemss = listss.items[i];
// 				var itemID = listss_itemss.id;
// 				var tenantcheck = listss_itemss.tenant_check;
// 				console.log(listss);
// 				Agreements
// 					.update({"_id":id, "inventory_list.data.lists": {
// 						$elemMatch: {
// 							"_id": listID,
// 							"items": {
// 								$elemMatch: {
// 									"_id": itemID
// 								}
// 							}
// 						}
// 					}},{
// 						$set: {
// 							"inventory_list.data.lists.0.items.$.tenant_check": tenantcheck
// 						}
// 					})
// 					.exec((err,updated) => {
// 						err ? reject(err)
// 							: resolve(updated);
// 					});
// 			}
// 		}
		// Agreements
		// 	.findById(id, (err, ilist) => {
		// 		for(var j = 0; j < ilist.inventory_list.data.lists.length; j++){
		// 			var list_arrayed = ilist.inventory_list.data.lists[j];
		// 			for(var k = 0; k < list_arrayed.items.length; k++){
		// 				var item_arrayed = list_arrayed.items[k];
		// 				var landlord_checks = item_arrayed.landlord_check;
		// 				var tenant_checks = item_arrayed.tenant_check;
		// 				var tenant_sign = ilist.inventory_list.data.confirmation.tenant.sign;

		// 				if(landlord_checks == true && tenant_checks == true){
		// 					if(tenant_sign){
		// 						let status = "completed";
		// 						var setStatusObj = {$set:{}};
		// 				    	setStatusObj.$set["inventory_list.data"] = {"status": status, "created_at": new Date()};
		// 				    	Agreements
		// 				    		.findByIdAndUpdate(id, setStatusObj)
		// 				    		.exec((err,updated) => {
		// 				    			err ? reject(err)
		// 				    				: resolve(updated);
		// 				    		});
		// 					}
		// 					else{
		// 						let status = "pending";
		// 						var setStatusObj = {$set:{}};
		// 				    	setStatusObj.$set["inventory_list.data"] = {"status": status, "created_at": new Date()};
		// 				    	Agreements
		// 				    		.findByIdAndUpdate(id, setStatusObj)
		// 				    		.exec((err,updated) => {
		// 				    			err ? reject(err)
		// 				    				: resolve(updated);
		// 				    		});
		// 					}
		// 				}
		// 			}
		// 		}
		// 	});
// 	});
// });


//change Status
agreementsSchema.static('changeStatus', (id:string, status:string, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		Agreements.createHistory(id, type);	

		let statusObj = {$set: {}};
		if (type == "letter_of_intent"){
			statusObj.$set["letter_of_intent.data"] = {"status": status, "created_at": new Date()};
		}
		if (type == "tenancy_agreement"){
			statusObj.$set["tenancy_agreement.data"] = {"status": status, "created_at": new Date()};
		}
		if (type == "inventory_list"){
			statusObj.$set["inventory_list.data"] = {"status": status, "created_at": new Date};
		}

		Agreements
			.findByIdAndUpdate(id, statusObj)
			.exec((err, updated) => {
				err ? reject(err)
					: resolve();
			});	
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

		console.log(body);
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
				_payment.refund = false;
				_payment.save((err, saved)=>{
					err ? reject(err)
						: resolve(saved);
				});	

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
			      			console.log("update",updated);
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
						"fee.attachment.payment_confirm": body.payment_confirm
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
						"attachment.payment_confirm": body.payment_confirm
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
						"attachment.payment_confirm": body.payment_confirm
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
		var ObjectID = mongoose.Types.ObjectId;	
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

agreementsSchema.static('acceptPayment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		
		var ObjectID = mongoose.Types.ObjectId;
		let body:any = data;
		let type:any = body.type;
		let receive_payment = parseInt(body.receive_payment);
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
				let gfd = parseInt(loiData.gfd_amount);
				let std = parseInt(loiData.sd_amount);
				let scd = parseInt(loiData.security_deposit);

				if (type == "letter_of_intent"){
					agreement.tenancy_agreement.data.status = "landlord-confirmation";
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
									feeStd = parseInt(_fee1.amount);
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
											feeGfd = parseInt(_fee2.amount);
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
										"typeInput": "loi"
									}					
									if(totalReceive - totalFee == 0)
									{	
										Agreements.feeUpdate(data);									
									}
									if (totalReceive - totalFee >= 1){									
										Agreements.feeUpdate(data);	
										Agreements.addRefund(data);	
									}
								});															
						});
				}
				if (type == "tenancy_agreement"){
					agreement.tenancy_agreement.data.status = "landlord-confirmation";
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
								feeScd = parseInt(_fee3.amount);
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
								"typeInput": "ta"
							}					
							if(totalReceive - totalFee == 0)
							{	
								Agreements.feeUpdate(data);									
							}
							if (totalReceive - totalFee >= 1){									
								Agreements.feeUpdate(data);	
								Agreements.addRefund(data);											
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
		Agreements.notification(id, type_notif);
	    Agreements
			.findById(id, (err, agreement) => {
				let loiData = agreement.letter_of_intent.data;
				let taData = agreement.tenancy_agreement.data;

				if (type == "letter_of_intent"){
					paymentID = loiData.payment.toString();					
					Agreements.feeNeededRefund(paymentID).then(res =>{
						console.log(res);
						agreement.letter_of_intent.data.status = "rejected";
						agreement.save((err, saved) => {
				      		err ? reject(err)
				      			: resolve({status: saved.letter_of_intent.data.status});
				      	});	
					});
				}
				if (type == "tenancy_agreement"){
					agreement.tenancy_agreement.data.status = "rejected";
					paymentID = taData.payment;
					Agreements.feeNeededRefund(paymentID).then(res =>{
						console.log(res);
						agreement.letter_of_intent.data.status = "rejected";
						agreement.save((err, saved) => {
				      		err ? reject(err)
				      			: resolve({status: saved.letter_of_intent.data.status});
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
							fee = parseInt(payments.fee[i].received_amount);
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

							if(type == "completedInventoryList"){
								message = "Inventory List completed for" + unit + " " + devResult.name;
								type_notif = "completed_Inventory_List";
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

let Agreements = mongoose.model('Agreements', agreementsSchema);

export default Agreements;