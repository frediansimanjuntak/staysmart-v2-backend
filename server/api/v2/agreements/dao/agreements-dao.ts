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
				}

				//put landlord
				Users
					.findById(landlordId, (err, landlorUser) => {
						let landlordData = landlorUser.landlord.data;
						Users
							.findById(userId, (err, tenantUser) => {
								let tenantData = tenantUser.tenant.data;
								console.log(tenantData.name);
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
									.find({"_id": userId}, {"tenant.data.bank_account.no": inputBankNo}, (err, user) => {
										if (!user){
											Users
												.update({"_id": id}, {
													$push:{
														"tenant.data.bank_account": body.bank_account
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
							    loiObj.$set["letter_of_intent.data.status"] = "pending";
							    loiObj.$set["letter_of_intent.data.created_at"] = new Date();

							    console.log(loiObj);
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

agreementsSchema.static('validateUserLandlord', (id:string, userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Agreements
			.findById(id, (err, agreement) => {
				let landlordId = agreement.landlord;

				if (landlordId =! userId){
					resolve({message: "forbidden"})
				}
			})
	});
});

agreementsSchema.static('acceptLoi', (id:string, data:Object, _userId:string):Promise<any> => {
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

agreementsSchema.static('rejectLoi', (id:string, _userId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		let type_notif = "rejectLoi";
		let type = "letter_of_intent";
		let status = "rejected";

		Agreements.changeStatus(id, status, type);
		Agreements.notification(id, type_notif);
	});
});

agreementsSchema.static('adminConfirmationLoi', (id:string, agreements:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		let type = "letter_of_intent";
		let status = "";
		let body:any = agreements;
		let attachment = body.attachment;

		Agreements
			.findById(id, (err, agreement) => {
				let paymentId = agreement.letter_of_intent.data.payment;

				if (body.type == "accept"){
			        Payments
			        	.findById(paymentId, (err, payment)=>{
			        		payment.payment_confirmation = attachment;
			        		payment.total_payment = body.total_payment;
			        		payment.save((err, saved)=>{
			        			err ? reject(err)
			        				: resolve(saved);
			        		})
			        	})	   
			    	status = "landlord-confirmation";
				}

				if (body.type == "reject"){
					Payments
			        	.findById(paymentId, (err, payment)=>{
			        		payment.remarks = body.remarks;
			        		payment.refund = true;
			        		payment.save((err, saved)=>{
			        			err ? reject(err)
			        				: resolve(saved);
			        		})
			        	})
			        status = "rejected";	
				}				
			})
		Agreements.changeStatus(id, status, type);
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

agreementsSchema.static('createTA', (id:string, data:Object, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		let type = "tenancy_agreement";
		let body:any = data;
		let remark = body.remark_payment;

		Agreements
			.findById(id, (err, agreement) => {
				let security_deposit = agreement["letter_of_intent.data.security_deposit"];
				let ta = agreement["tenancy_agreement.data"];
				if (ta != null){
					Agreements.createHistory(id, type);
				}

				let fee = {
					"scd" : security_deposit
				};
				
				agreement.tenancy_agreement.data.status = "admin-confirmation";
				agreement.tenancy_agreement.data.created_at = new Date();
				agreement.save((err, saved)=>{
					err ? reject(err)
						: resolve();
				});


				if(files){
					Agreements.payment(id, fee, remark, files, type);
					Agreements.confirmation(id, files, type);
				} 
			})		
	});
});

agreementsSchema.static('acceptTA', (id:string, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let type_notif = "acceptTA";
		let type = "tenancy_agreement";	
		let status = "accepted";

		Agreements
			.findById(id, (err, agreement)=>{
				let propertyId = agreement.property;
				let tenantID = agreement.tenant;
				let termLease = agreement.letter_of_intent.data.term_lease;
				let termLeaseExtend = agreement.letter_of_intent.data.term_lease_extend;
				let dateCommencement = agreement.letter_of_intent.data.date_commencement;
				let longTerm = termLease + termLeaseExtend;

				let until = dateCommencement(+ dateCommencement + longTerm *30*24*60*60*1000) ;
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
			})
		Agreements.confirmation(id, files, type);		
		Agreements.changeStatus(id, status, type);		
		Agreements.notification(id, type_notif);
	});
});

agreementsSchema.static('rejectTA', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		let type_notif = "rejectTA";
		let type = "tenancy_agreement";
		let status = "rejected";

		Agreements.changeStatus(id, status, type);
		Agreements.notification(id, type_notif);
	});
});

agreementsSchema.static('adminConfirmationTA', (id:string, agreements:Object, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		let type = "tenancy_agreement";
		let status = "";
		let file:any = files;
		let body:any = agreements;
		let paymentConfirm = file.paymentConfirm;


		Agreements
			.findById(id, (err, agreement) => {
				let paymentId = agreement.tenancy_agreement.data.payment;

				if (body.type == "accept"){
					Attachments.createAttachments(paymentConfirm).then(res => {
				        var idPaymentFile = res.idAtt;
				        console.log(idPaymentFile);
				        Payments
				        	.findById(paymentId, (err, payment)=>{
				        		payment.payment_confirmation = idPaymentFile;
				        		payment.total_payment = body.total_payment;
				        		payment.save((err, saved)=>{
				        			err ? reject(err)
				        				: resolve(saved);
				        		})
				        	})	        
			    	});
			    	status = "landlord-confirmation";
				}
				if (body.type == "reject"){
					Payments
			        	.findById(paymentId, (err, payment)=>{
			        		payment.remarks = body.remarks;
			        		payment.refund = true;
			        		payment.save((err, saved)=>{
			        			err ? reject(err)
			        				: resolve(saved);
			        		})
			        	})
			        status = "rejected";	
				}				
			})
		Agreements.changeStatus(id, status, type);	
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
    Agreements.confirmation(id, type, files)
    Agreements
    	.findByIdAndUpdate(id, agreements)
    	.populate("property")
    	.exec((err,updated) => {
    		err ? reject(err)
    			: resolve(updated);
    	});
   	});
}); 

agreementsSchema.static('updateInventoryList', (id:string, agreements:Object, filesId:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if(!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}

		// let file:any = filesId;
		// let type = "inventory_list";
		let body:any = agreements;
		// Agreements.createHistory(id, type);
		// Agreements.confirmation(id, filesId, type);
		
		for (var h = 0; h < body.lists.length; h++){
			if (!body.lists[h].id){
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

agreementsSchema.static('acceptInventoryList', (id:string, files:Object):Promise<any> => {

	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let type_notif = "acceptInventoryList";
		let type = "inventory_list";
		let status = "completed";

		Agreements.confirmation(id, files, type);
		Agreements
			.findByIdAndUpdate(id, {
				$set: {
					"status": "completed"
				}
			})
			.exec((err,updated) => {
				err ? reject(err)
					: resolve(updated);
			});
				
		Agreements.changeStatus(id, status, type);		
		Agreements.notification(id, type_notif);
	})
})
  

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
    	let data = ""
        Agreements
          .findById(id, typeDataa, (err, result) => {
          	if (typeDataa == "letter_of_intent"){
            	data = result.letter_of_intent.data;
            }
            if (typeDataa == "tenancy_agreement"){
            	data = result.tenancy_agreement.data;
            }
            if (typeDataa == "inventory_list"){
            	data = result.tenancy_agreement.data;
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

		if(status == "landlord"){
			typeData = type+'.data.confirmation.landlord'
		}
		else if(status == "tenant"){
			typeData = type+'.data.confirmation.landlord'
		}

		Agreements
			.findById(id, typeData, (err, agreement)=>{
				agreement.sign = sign;
				agreement.date = new Date();
				agreement.save((err, saved) => {
			    err ? reject(err)
			        : resolve(saved);
			    });
			})
	});
});

//payment
agreementsSchema.static('payment', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = data;
		let type = body.type; //type ('letter_of_intent', 'tenancy_agreement', 'inventory_list')
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
					payObj.$set["letter_of_intent.data.payment"] = paymentId;

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
					payObj.$set["tenancy_agreement.data.payment"] = paymentId;
				}

				var _payment = new Payments();
				_payment.type = paymentType;
				_payment.fee = paymentFee;
				_payment.remarks = body.remark;
				_payment.attachment = body.attachment;
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
			      	});	
			})
		
	});
});

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
							if(type == "acceptInventoryList"){
								message = "Inventory List accepted for" + unit + " " + devResult.name;
								type_notif = "received_Inventory_List";
								user = tenantId;
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