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

		Agreements.confirmation(id, data, type);		
		Agreements.changeStatus(id, status, type);		
		Agreements.notification(id, type_notif);
	});
});

agreementsSchema.static('rejectLoi', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		let type_notif = "rejectLoi";

		Agreements
			.findById(id, (err, agreement) => {
				let loiData = agreement.letter_of_intent.data;	
				loiData.status = "rejected";
				agreement.save();			
				let paymentID = loiData.payment;

				Payments
					.findByIdAndUpdate(paymentID, {
						$set: {
							"refund": true
						}
					})
					.exec((err, updated) => {
			      		err ? reject(err)
			      			: resolve(updated);
			      			console.log(updated);
			      	});
			})
		Agreements.notification(id, type_notif);
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
		console.log(data);
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
						: resolve();
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

		let type_notif = "rejectTA";

		Agreements
			.findById(id, (err, agreement) => {
				let loiData = agreement.tenancy_agreement.data;	
				loiData.status = "rejected";
				agreement.save();			
				let paymentID = loiData.payment;

				Payments
					.findByIdAndUpdate(paymentID, {
						$set: {
							"refund": true
						}
					})
					.exec((err, updated) => {
			      		err ? reject(err)
			      			: resolve(updated);
			      			console.log(updated);
			      	});
			})
		Agreements.notification(id, type_notif);
	});
});

//Inventory List
agreementsSchema.static('createInventoryList', (id:string, agreements:Object, files:Object):Promise<any> => { 
  return new Promise((resolve:Function, reject:Function) => { 
    if (!_.isObject(agreements)) { 
      return reject(new TypeError('Agreement is not a valid object.')); 
    } 
    let file:any = files;
    let type = "inventory_list";
    let status = "pending";
    

    var statusObj = {$set:{}};
    	statusObj.$set["inventory_list.data"] = {"status": status, "created_at": new Date()};
    	Agreements
    		.findByIdAndUpdate(id, statusObj)
    		.exec((err,updated) => {
    			err ? reject(err)
    				: resolve(updated);
    		});
    var setlandlordcheck = {$set:{}};
    	setlandlordcheck.$set['inventory_list.data.lists.0.items.$'] = {"landlord_check": true};
    	Agreements
    		.findByIdAndUpdate(id, setlandlordcheck)
    		.exec((err,updated) => {
    			err ? reject(err)
    				: resolve(updated);
    		});
    Agreements
    	.findByIdAndUpdate(id, agreements)
    	.populate("property")
    	.exec((err,updated) => {
    		err ? reject(err)
    			: resolve(updated);
    	});
   	});
}); 

agreementsSchema.static('updateInventoryList', (id:string, agreements:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if(!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}

		let body:any = agreements;
		let type = "inventory_list";
		let status = "pending";
		Agreements.createHistory(id, type);
    	var setStatusObj = {$set:{}};
    	setStatusObj.$set["inventory_list.data"] = {"status": status, "created_at": new Date()};
    	Agreements
    		.findByIdAndUpdate(id, setStatusObj)
    		.exec((err,updated) => {
    			err ? reject(err)
    				: resolve(updated);
    		});

		for (var h = 0; h < body.lists.length; h++){
			var listID = body.lists[h].id;
			if (!listID){
				Agreements
					.update({"_id":id},{
						$push: {
							"inventory_list.data.lists":body.lists[h]
						}
					})
					.exec((err,updated) => {
						err ? reject(err)
							: resolve(updated);
					});
			}
			else{
				Agreements
					.update({"_id": id, "inventory_list.data.lists": {
						$elemMatch: {
							"_id": body.lists[h].id
						}
					}}, {
						$set: {
							"inventory_list.data.lists.$.name":body.lists[h].name,
							"inventory_list.data.lists.$.items":body.lists[h].items
						}
					})
					.exec((err,updated) => {
						err ? reject(err)
							: resolve(updated);
					});
			}
		}
		
	});
		
});

agreementsSchema.static('updateTenantCheck', (id:string, agreements:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if(!_.isObject(agreements)) {
			return reject(new TypeError('agreement is not a valid object.'));
		}
		let body:any = agreements;
		for (var h = 0; h < body.lists.length; h++){
			var listss = body.lists[h];
			var listID = listss.id;
			for (var i = 0; i < listss.items.length; i++){
				var listss_itemss = listss.items[i];
				var itemID = listss_itemss.id;
				var tenantcheck = listss_itemss.tenant_check;
				console.log(listss);
				Agreements
					.update({"_id":id, "inventory_list.data.lists": {
						$elemMatch: {
							"_id": listID,
							"items": {
								$elemMatch: {
									"_id": itemID
								}
							}
						}
					}},{
						$set: {
							"inventory_list.data.lists.0.items.$.tenant_check": tenantcheck
						}
					})
					.exec((err,updated) => {
						err ? reject(err)
							: resolve(updated);
					});
			}
		}
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
	});
});


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
						"code": "std",
						"name": "Stamp Duty",
						"amount": std, 
						"status": "unpaid", 
						"refunded": false
					},
					{
						"code": "gfd",
						"name": "Good Faith Deposit",
						"amount": gfd, 
						"status": "unpaid", 
						"refunded": false
					}];
					paymentType = "loi";
				}
				else if (type ==  "tenancy_agreement"){
					paymentFee = [{
						"code": "scd",
						"name": "Security Deposit",
						"amount": scd, 
						"status": "unpaid", 
						"refunded": false
					}];
					paymentType = "ta";
				}

				var _payment = new Payments();
				_payment.type = paymentType;
				_payment.fee = paymentFee;
				_payment.attachment = body.attachment;
				_payment.refund = false;
				_payment.save((err, saved)=>{
					err ? reject(err)
						: resolve(saved);
						console.log(saved);
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
			      			console.log(updated);
			      	});	
			})		
	});
});

agreementsSchema.static('acceptPayment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}		

		let body:any = data;
		let type:any = body.type;

	    Agreements
			.findById(id, (err, agreement) => {
				let loiData = agreement.letter_of_intent.data;			
				
				let gfd = loiData.gfd_amount;
				let std = loiData.sd_amount;
				let scd = loiData.security_deposit;
				let paymentID = loiData.payment;

				let paymentTotal = gfd + std ;
				if (type == "letter_of_intent"){
					agreement.tenancy_agreement.data.status = "landlord-confirmation";
					paymentTotal = gfd + std;
				}
				if (type == "tenancy_agreement"){
					agreement.tenancy_agreement.data.status = "landlord-confirmation";
					paymentTotal = scd;
				}
				agreement.save();

				let refund = null;
				let fee_status = "";
				let minus_payment = 0;
				let refund_payment = 0;

				if (paymentTotal == body.total_payment){
					refund = false ;
					fee_status = "paid";
					minus_payment = 0;
					refund_payment = 0;
				}
				if (paymentTotal <= body.total_payment){
					refund = false;
					fee_status = "unpaid";
					minus_payment = paymentTotal - body.total_payment;
					refund_payment = 0;
				}
				if (paymentTotal >= body.total_payment){
					refund = true;
					fee_status = "paid";
					minus_payment = 0;
					refund_payment = body.total_payment - paymentTotal;
				}

				Payments
					.findByIdAndUpdate(paymentID, {
						$set: {
							"fee.$.status": fee_status,
							"fee_payment": paymentTotal,
							"total_payment": body.total_payment,
							"minus_payment": minus_payment,
							"refund_payment": refund_payment,
							"refund": refund
						}
					})
					.exec((err, updated) => {
			      		err ? reject(err)
			      			: resolve(updated);
			      			console.log(updated);
			      	});
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

	    Agreements
			.findById(id, (err, agreement) => {

				if (type == "letter_of_intent"){
					agreement.letter_of_intent.data.status = "rejected";
				}
				if (type == "tenancy_agreement"){
					agreement.tenancy_agreement.data.status = "rejected";
				}
				agreement.save();

				let paymentID = agreement.letter_of_intent.data.payment;

				Payments
					.findByIdAndUpdate(paymentID, {
						$set: {
							"remarks": body.remarks,
							"refund": true
						}
					})
					.exec((err, updated) => {
			      		err ? reject(err)
			      			: resolve(updated);
			      			console.log(updated);
			      	});
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