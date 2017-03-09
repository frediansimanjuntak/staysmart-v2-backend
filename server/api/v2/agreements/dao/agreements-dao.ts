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
		var _agreements = new Agreements(agreements);		
		_agreements.save((err, saved)=>{
			err ? reject(err)
				: resolve(saved);
		});
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

agreementsSchema.static('createLoi', (id:string, data:Object, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		let body:any = data;
		let type = "letter_of_intent";

		Agreements
			.findById(id, "letter_of_intent.data", (err, agreement) => {
				let propertyId = agreement.property;
				let landlordId = agreement.landlord;
				let tenantId = agreement.tenant;

				if (agreement != null){
					Agreements.createHistory(id, type);
				}

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
			    loiObj.$set["letter_of_intent.data"] = {
			    	"sd_amount": sd_amount, 
			    	"security_deposit": security_deposit,
			    	"status": "pending",
			    	"created_at": new Date()
			    };

				Agreements
					.update(_query, loiObj)
					.exec((err, updated) => {
						err ? reject(err)
							: resolve();
					});	

				var fee = {
					"gfd": gfd_amount,
					"std": sd_amount, 
			    	"scd": security_deposit
				}

				if(files){
					Agreements.payment(id, fee, remark, files, type);
					Agreements.confirmation(id, files, type);
				} 

				if(body.status == "send"){
					let type_notif = "initiateLoi";
					Agreements.notification(id, type_notif);
					Properties
						.findByIdAndUpdate(propertyId, {
							$set: {
								"status": "initiated"
							}
						})
						.exec((err, updated) => {
							err ? reject(err)
								: resolve();
						});
				}   
			})		
	});
});

agreementsSchema.static('acceptLoi', (id:string, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let type_notif = "acceptLoi";
		let type = "letter_of_intent";	
		let status = "accepted";

		Agreements.confirmation(id, files, type);		
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
		let type = "letter_of_intent";
		let status = "rejected";

		Agreements.changeStatus(id, status, type);
		Agreements.notification(id, type_notif);
	});
});

agreementsSchema.static('adminConfirmationLoi', (id:string, agreements:Object, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		let type = "letter_of_intent";
		let status = "";
		let file:any = files;
		let body:any = agreements;
		let paymentConfirm = file.paymentConfirm;

		Agreements
			.findById(id, (err, agreement) => {
				let paymentId = agreement.letter_of_intent.data.payment;

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
      return reject(new TypeError('Inventory List is not a valid object.')); 
    } 

    let file:any = files;
    let body:any = agreements;

    Agreements
    	.findById(id, (err, ilist) => {
    		let propertyId = ilist.property;

    		if (ilist != null){
    			let type = "inventory_list";
    			Agreements.createHistory(id, type);
    		}

    		Agreements
    			.findByIdAndUpdate(id, {
    				$set: {
    					"inventory_list.data.status": "pending",
    					"inventory_list.data.property": propertyId,
    					"inventory_list.data.created_at": new Date()
    				}
    			})
    			.exec((err, updated) => {
					err ? reject(err)
						: resolve();
				});	    		

    		let list = body.lists;
    		let listData = [].concat(list);

    		for(var i = 0; i < listData.length; i++){

    			let listss = listData[i];
    			let listname = listss.name;
    			Agreements
	    			.findByIdAndUpdate(id, {
	    				$push: {
	    					"inventory_list.data.$.lists": {
	    						"name": listname
	    					}
	    				}
	    			})
	    			.exec((err, updated) => {
						err ? reject(err)
							: resolve(updated);
					});	
				let item = body.items;
				let itemData = [].concat(item);

				for(var j = 0; j < itemData.length; j++){
					let itemss = itemData[j];
					let itemName = itemss.name;
					let itemQuantity = itemss.quantity;
					let itemRemark = itemss.remark;
					let itemLandlordCheck = false;
					let itemTenantCheck = false;

					let attachments = file.attachment;
					if(file){
						Attachments.createAttachments(attachments).then(res => {
					        var idAttachment = res.idAtt;
					        console.log(idAttachment);
							Agreements
								.Update({"_id": id, "inventory_list.data.lists.name": listname}, {
									$push: {
										"inventory_list.data.0.lists.$.items": {
											"attachments": idAttachment
										}
									}

								})
								.exec((err, updated) => {
									err ? reject(err)
										: resolve(updated);
								});	        
					    });
					}					

					Agreements
	    			.Update({"_id": id, "inventory_list.data.lists.name": listname}, {
	    				$push: {
	    					"inventory_list.data.0.lists.$.items": {
	    						"name": itemName,
	    						"quantity": itemQuantity,
	    						"remark": itemRemark,
	    						"landlord_check": itemLandlordCheck,
	    						"tenant_check": itemTenantCheck
	    					}
	    				}

	    			})
	    			.exec((err, updated) => {
						err ? reject(err)
							: resolve(updated);
					});	
				}
    		}
   		}); 
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
			statusObj.$set["letter_of_intent.data"] = {"status": status, "created_at": new Date};
		}
		if (type == "tenancy_agreement"){
			statusObj.$set["tenancy_agreement.data"] = {"status": status, "created_at": new Date};
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
agreementsSchema.static('createHistory', (id:string, type:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Agreements
          .findById(id, type, (err, result) => {
            var historyObj = {$push: {}};
            historyObj.$push[type+'.histories'] = {"date": Date.now, "data": result.data};
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
agreementsSchema.static('confirmation', (id:string, files:Object, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		let typeDataLandlord = type+'.data.confirmation.landlord';
		let typeDataTenant = type+'.data.confirmation.tenant';
		let file:any = files;
		let landlordFile = file.landlord;
		let tenantFile = file.tenant;


		if (landlordFile){
			Attachments.createAttachments(landlordFile).then(res => {
	          var idLandlordFile = res.idAtt;
	          Agreements
	          	.findById(id, typeDataLandlord, (err, agreement)=>{
	          		agreement.sign = idLandlordFile;
	          		agreement.date = new Date();
	          		agreement.save((err, saved) => {
				        err ? reject(err)
				            : resolve(saved);
				        });
					})
	        });
		}

		if (tenantFile){
			Attachments.createAttachments(tenantFile).then(res => {
	          var idTenantFile = res.idAtt;
	          Agreements
	          	.findById(id, typeDataTenant, (err, agreement)=>{
	          		agreement.sign = idTenantFile;
	          		agreement.date = new Date();
	          		agreement.save((err, saved) => {
				        err ? reject(err)
				            : resolve(saved);
				        });
					})
	        });
		}
	});
});

//payment
agreementsSchema.static('payment', (id:string, fees:Object, remark:string, files:Object, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {

		let file:any = files;
		let fee:any = fees;
		let paymentFile = file.payment;
		let paymentFee = [];
		let payObj = {$set: {}};

		if(type == "letter_of_intent"){
			paymentFee = [{
				"code": "std",
				"name": "Stamp Duty",
				"amount": fee.std, 
				"status": "unpaid", 
				"refunded": false
			},
			{
				"code": "gfd",
				"name": "Good Faith Deposit",
				"amount": fee.gfd, 
				"status": "unpaid", 
				"refunded": false
			}];

			payObj.$set["letter_of_intent.data"] = {"payment": paymentId};

		}
		else if (type ==  "tenancy_agreement"){
			paymentFee = [{
				"code": "scd",
				"name": "Security Deposit",
				"amount": fee.scd, 
				"status": "unpaid", 
				"refunded": false
			}];

			payObj.$set["tenancy_agreement.data"] = {"payment": paymentId};
		}

		var _payment = new Payments();
		_payment.type = type;
		_payment.fee = paymentFee;
		_payment.remarks = remark;
		_payment.refund = false;
		_payment.save((err, saved)=>{
			err ? reject(err)
				: resolve(saved);
		});	

		var paymentId = _payment._id;

		if(paymentFile){
			Attachments.createAttachments(paymentFile).then(res => {
		        var idPaymentFile = res.idAtt;

		        Payments
		        	.findById(paymentId, (err, payment)=>{
		        		payment.attachment = idPaymentFile;
		        		payment.save((err, saved)=>{
		        			err ? reject(err)
		        				: resolve(saved);
		        		})
		        	})	        
		    });
		}	

		Agreements
			.findByIdAndUpdate(id, payObj)
			.exec((err, updated) => {
	      		err ? reject(err)
	      			: resolve(updated);
	      	});	
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