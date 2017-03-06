import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import agreementsSchema from '../model/agreements-model';
import Users from '../../users/dao/users-dao';
import Payments from '../../payments/dao/payments-dao';
import Attachments from '../../attachments/dao/attachments-dao'
import Appointments from '../../appointments/dao/appointments-dao'

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
agreementsSchema.static('createLoi', (id:string, data:Object, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		let body:any = data;
		let type = "letter_of_intent";

		Agreements
			.findById(id, "letter_of_intent.data", (err, agreement) => {
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

				if(files){
					Agreements.payment(id, sd_amount, gfd_amount, security_deposit, remark, files, type);
					Agreements.confirmation(id, data, files, type);
				}    
			})		
	});
});

//TA
agreementsSchema.static('createTA', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		let agreementObj = {$set: {}};
		for(var param in data) {
			if(param == 'status' || param == 'payment') {
				agreementObj.$set['tenancy_agreement.data.' + param] = data[param];
			}
			agreementObj.$set['tenancy_agreement.data.confirmation.landlord.' + param] = data[param];
		}
		Agreements
			.findByIdAndUpdate(id,agreementObj)
			.exec((err, updated) => {
				err ? reject(err)
				: resolve();
			});	
	});
});

agreementsSchema.static('updateTA', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		var type = 'tenancy_agreement';
		let body:any = data;
		let agreementObj = {$set: {}};
		for(var param in data) {
			if(param == 'status' || param == 'payment') {
				agreementObj.$set['tenancy_agreement.data.' + param] = data[param];
			}
			agreementObj.$set['tenancy_agreement.data.confirmation.tenant.' + param] = data[param];
		}

		if(body.status = 'accepted') {
			Agreements
				.findById(id, (err, result) => {
					var propertyID = result.property;
					var tenantID = result.tenant;
					var date_start = result.letter_of_intent.data.date_commencement;
					var rent_time = result.letter_of_intent.data.term_lease;
					var extend_rent_time = result.letter_of_intent.data.term_lease_extend;
					var long_rent_time = rent_time + extend_rent_time;
					
					Users
						.findById(tenantID, {
							$push: {
								"rented_properties": {
									"until": new Date(+ new Date() + long_rent_time * 30 * 24 * 60 * 60 * 1000),
									"property": propertyID,
									"agreement": id
								}
							}
						})
						.exec((err, updated) => {
							err ? reject(err)
							: resolve();
						});	
				})
		}

		Agreements.createHistory(id, type);
		Agreements
			.findByIdAndUpdate(id,agreementObj)
			.exec((err, updated) => {
				err ? reject(err)
				: resolve();
			});	
	});
});


agreementsSchema.static('createLOIandTAHistory', (id:string, type:string):Promise<any> => {
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

agreementsSchema.static('createInventoryList', (id:string, agreements:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Inventory List is not a valid object.'));
		}
		Agreements
			.findById(id, (err,ilist) => {
				
					var ObjectID = mongoose.Types.ObjectId;
					var data_result = {$set: {}};
					var list_result = {$push: {}};
					var item_result = {$push: {}};
					let body:any = agreements;
					data_result.$set['.data'] = {
						"lists":list_result.$push['.lists'] = {
							"name": body.name, 
							"items": item_result.$push['.items'] = {
								"name": body.name,
								"quantity": body.quantity,
								"remark": body.remark,
								"landlord_check": body.landlord_check,
								"tenant_check": body.tenant_check
							},
						},
					};
					
						Agreements
						.findByIdAndUpdate(id, data_result)
						.exec((err,updated) => {
							err ? reject(err)
								: resolve(updated);
						});

					// Agreements
					// 	.findById(id, (err,ilist) => {
					// 		var ILData = ilist.inventory_list.data;
					// 		var ILList = ilist.inventory_list.data.lists;
					// 		var ILItem = ilist.inventory_list.data.lists.items;
					// 		var Listname = ilist.inventory_list.data.lists.name;
					// 		var Itemname = ilist.inventory_list.data.lists.items.name;

					// 		if(ILData == null){
					// 			Agreements.ilist(body);						
					// 		}

					// 		if(body.Listname != ILList.name ||
					// 			body.Itemname != ILItem.name ||
					// 			body.quantity != ILItem.quantity ||
					// 			body.remark != ILItem.remark ||
					// 			body.landlord_check != ILItem.landlord_check ||
					// 			body.tenant_check != ILItem.tenant_check) {

					// 			Agreements
					// 				.findByIdAndUpdate(id, {
					// 					$push: {
					// 						"inventory_list.histories":{
					// 							"date": new Date(),
					// 							"data": ILData
					// 						}
					// 					}
					// 				})
					// 				.exec((err,updated) => {
					// 					err ? reject(err)
					// 						: resolve(updated);
					// 				});
					// 				Agreements.ilist(body);
					// 		}
					// 	})
			})



            Agreements
              .findByIdAndUpdate(id, agreements)
              .populate("property")
              .exec((err, updated) => {
                err ? reject(err)
                : resolve(updated);
              });

    });
});

//confirmation
agreementsSchema.static('confirmation', (id:string, data:Object, files:Object, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}

		let typeDataLandlord = type+'.data.confirmation.landlord';
		let typeDataTenant = type+'.data.confirmation.tenant';
		let body:any = data;
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
	          		agreement.remarks = body.remarks
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
	          		agreement.remarks = body.remarks
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
agreementsSchema.static('payment', (id:string, std:number, gfd:number, scd:number, remark:string, files:Object, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {

		let file:any = files;
		let paymentFile = file.payment;
		if(type == "letter_of_intent"){
			var _payment = new Payments();
			_payment.type = type;
			_payment.fee = [{
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
			}]
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
			        console.log(idPaymentFile);
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
				.findByIdAndUpdate(id, {
					$set: {
						"letter_of_intent.data.payment": paymentId
					}
				})
				.exec((err, updated) => {
		      		err ? reject(err)
		      			: resolve(updated);
		      	});
		}

		if(type == "tenancy_agreement"){
			var _payment = new Payments();
			_payment.type = type;
			_payment.fee = [{
				"code": "scd",
				"name": "Security Deposit",
				"amount": scd, 
				"status": "unpaid", 
				"refunded": false
			}]
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
			        console.log(idPaymentFile);
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
				.findByIdAndUpdate(id, {
					$set: {
						"tenancy_agreement.data.payment": paymentId
					}
				})
				.exec((err, updated) => {
		      		err ? reject(err)
		      			: resolve(updated);
		      	});
		}		
	});
});

let Agreements = mongoose.model('Agreements', agreementsSchema);

export default Agreements;