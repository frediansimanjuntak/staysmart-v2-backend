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

agreementsSchema.static('createAgreements', (agreements:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		let body:any = agreements;

		var _agreements = new Agreements(agreements);
		_agreements.save((err, saved)=>{
			err ? reject(err)
			: resolve(saved);
		});
	});
});

agreementsSchema.static('createTA', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		let agreementObj = {$set: {}};
		for(var param in data) {
			if(param == 'status' || param == 'payment') {
				agreementObj.$set['tenancy_agreement.data.'+param] = data[param];
			}
			agreementObj.$set['tenancy_agreement.data.confirmation.landlord.'+param] = data[param];
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
				agreementObj.$set['tenancy_agreement.data.'+param] = data[param];
			}
			agreementObj.$set['tenancy_agreement.data.confirmation.tenant.'+param] = data[param];
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
									"until": new Date(+new Date() + long_rent_time*30*24*60*60*1000),
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

		Agreements.createLOIandTAHistory(id, type);
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

agreementsSchema.static('updateInventoryList', (id:string, agreements:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Inventory List is not a valid object.'));
		}
		Agreements
			.findById(id, (err,ilist) => {
				
					var ObjectID = mongoose.Types.ObjectId;
					var list_result = {$push: {}};
					var item_result = {$push: {}};
					let body:any = agreements
					list_result.$push['.data'] = {
						"name": body.name, 
						"items": item_result.$push['.list'] = {
							"name": body.name,
							"quantity": body.quantity,
							"remark": body.remark,
							"attachments":  
								Attachments.createAttachments(agreements).then(res => {
									var idAttachment = res.idAtt;
									for ( var i = 0; i < idAttachment.length; i++){
										Agreements
										.findByIdAndUpdate(id,{
											$push: {
												"attachments": idAttachment[i]
											}
										})
										.exec((err,updated) => {
											err ? reject(err)
												: resolve(updated);
										});
									}
								}),
							
							"landlord_check": body.landlord_check,
							"tenant_check": body.tenant_check
						}};
						Agreements
						.findByIdAndUpdate(id, list_result)
						.exec((err,updated) => {
							err ? reject(err)
								: resolve(updated);
						});
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

agreementsSchema.static('createLIHistories', (id:string):Promise =>{
	return new Promise((resolve:Function, reject:Function) => {
		Agreements
			.findById(id, (err, ilist) => {
				var ILHistoryObj = {$push: {}};
				ILHistoryObj.$push['.histories'] = {"date": Date.now, "data": ilist.data};
				Agreements
					.findByIdAndUpdate(id, ILHistoryObj)
					.exec((err,saved) => {
						err ? reject(err)
							: resolve(saved);
					});
			})
	});
});

agreementsSchema.static('createLoi', (id:string, agreements:Object, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}
		let body:any = agreements;
		let file:any = files;
		let front = file.front;
		let back = file.back;

		Appointments
			.findById(id, (err, appointment)=>{
				var landlordID = appointment.landlord;
				var tenantID = appointment.tenant;
				var propertyID = appointment.property
				var appointmentID = appointment._id;

				var _agreements = new Agreements(agreements);
				_agreements.landlord = landlordID;
				_agreements.tenant = tenantID;
				_agreements.property = propertyID;
				_agreements.appointment = appointmentID;
				_agreements.save();

				var agreementId = _agreements._id;

				Users
					.findById(landlordID, (err, userlandlord) =>{
						var landlordData = userlandlord.landlord.data;

						Users
							.findById(tenantID, (err, usertenant)=>{
								var tenantData = usertenant.tenant.data;
								if (tenantData == null){
									Agreements.userTenant(tenantID, body, files, agreementId)
								}

								if(body.name != tenantData.name || body.identification_type != tenantData.identification_type || body.identification_number != tenantData.identification_number){
									
									Users
										.findByIdAndUpdate(tenantID, {
											$push: {
												"tenant.histories":{
													"date": new Date(),
													"data": tenantData
												}
											}
										})
										.exec((err, updated) => {
								      		err ? reject(err)
								      			: resolve(updated);
								      	});

									Agreements.userTenant(tenantID, body, files, agreementId);
								}
								

								Agreements
									.findById(agreementId, (err, agreement)=>{
										var loi = agreement.letter_of_intent.data;

										Users
											.findById(tenantID, (err, tenantt)=>{
												var userTenant = tenantt.tenant.data;

												if(loi != null){
													Agreements
														.findByIdAndUpdate(agreementId, {
															$push: {
																"letter_of_intent.histories": {
																	"date": new Date(),
																	"data": loi
																}
															}
														})
														.exec((err, updated) => {
												      		err ? reject(err)
												      			: resolve(updated);
												      	});
										      		Agreements.loi(agreementId, body, userTenant, landlordData, files);
												}

												if(loi == null){
													Agreements.loi(agreementId, body, userTenant, landlordData, files);
												}
											})										
									})
							})
					})
			})
		});
});


agreementsSchema.static('loi', (id:string, user:Object, tenantData:Object, landlordData:Object, files:Object,):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(user)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}

		let body:any = user;
		let tenant:any = tenantData;
		let landlord:any = landlordData;
		
		let monthly_rental = body.monthly_rental;
		let term_lease = body.term_lease;
		let security_deposit = 0;

		let gfd_amount = monthly_rental;
		let sd_amount = Math.round((monthly_rental*term_lease)*0.4/100);

		if (term_lease <= 12){
			security_deposit = gfd_amount;
		}

		else if(term_lease > 12 && term_lease <= 24){
			security_deposit = gfd_amount * 2;
		}

		let _query = {"_id": id};
		let loiObj = {$set: {}};
	    for(var param in body) {
	    	loiObj.$set["letter_of_intent.data."+param] = body[param];
	    }
 	
	    Agreements
	     	.update(_query,{
	      		$set: {
	      			"letter_of_intent.data.landlord.full_name"				: landlord.name,
	      			"letter_of_intent.data.landlord.type"					: landlord.identification_type,
	      			"letter_of_intent.data.landlord.identification_number"	: landlord.identification_number,
					"letter_of_intent.data.landlord.identity_front"			: landlord.identification_proof.front,
					"letter_of_intent.data.landlord.identity_back"			: landlord.identification_proof.back,
					"letter_of_intent.data.tenant.name"						: tenant.name,
					"letter_of_intent.data.tenant.type"						: tenant.identification_type,
					"letter_of_intent.data.tenant.identification_number"	: tenant.identification_number,
					"letter_of_intent.data.tenant.identity_front"			: tenant.identification_proof.front,
					"letter_of_intent.data.tenant.identity_back"			: tenant.identification_proof.back,
					"letter_of_intent.data.status"							: "pending",		
					"letter_of_intent.data.created_at"						: new Date(),
					"letter_of_intent.data.gfd_amount"						: gfd_amount,
					"letter_of_intent.data.sd_amount"						: sd_amount,
					"letter_of_intent.data.security_deposit"				: security_deposit
				}
	      	})
	      	.exec((err, updated) => {
	      		err ? reject(err)
	      			: resolve(updated);
	      	});

	    Agreements
	      	.update(_query, loiObj)
	      	.exec((err, updated) => {
	      		err ? reject(err)
	      			: resolve(updated);
	      	});	

	    let remark = body.remark_payment;
	    Agreements.payment(id, sd_amount, gfd_amount, security_deposit, remark, files);
	});
});

agreementsSchema.static('userTenant', (id:string, user:Object, files:Object, agreementId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(user)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}

		let body:any = user;
		let file:any = files;
		let front = file.front;
		let back = file.back;

		if(front){
			Attachments.createAttachments(front).then(res => {
	          var idFront = res.idAtt;
	          Users
	            .update({"_id": id}, {
	              $set: {
	                "tenant.data.identification_proof.front": idFront
	              }
	            })
	            .exec((err, updated) => {
	              err ? reject(err)
	              : resolve(updated);
	            });  
	          Agreements
	          	.update({"_id": agreementId}, {
	          		$set: {
	          			"letter_of_intent.data.tenant.identity_front" : idFront,
	          		}
	          	})
	          	.exec((err, updated) => {
	              err ? reject(err)
	              : resolve(updated);
	            });
	        });
		}

		if(back){
			Attachments.createAttachments(back).then(res => {
	          var idBack = res.idAtt;
	          Users
	            .update({"_id": id}, {
	              $set: {
	                "tenant.data.identification_proof.back": idBack
	              }
	            })
	            .exec((err, updated) => {
	              err ? reject(err)
	              : resolve(updated);
	            }); 
	          Agreements
	          	.update({"_id": agreementId}, {
	          		$set: {
	          			"letter_of_intent.data.tenant.identity_back" : idBack,
	          		}
	          	})
	          	.exec((err, updated) => {
	              err ? reject(err)
	              : resolve(updated);
	            }); 
	        });
		}

		Users
			.findByIdAndUpdate(id, {
				$set: {
					"tenant.data.name"					: body.name,
					"tenant.data.identification_type"	: body.identification_type,
					"tenant.data.identification_number"	: body.identification_number
				}
			})
			.exec((err, updated) => {
				err ? reject(err)
				: resolve(updated);
			});		
	});
});


agreementsSchema.static('updateLoi', (id:string, agreements:Object, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}

		let body:any = agreements;
		let file:any = files;
		
		Agreements
			.findById(id, (err, agreement)=>{
				var loi = agreement.letter_of_intent;

				Agreements
					.findByIdAndUpdate(id, {
						$push: {
							"letter_of_intent.histories": {
								"date": new Date(),
								"data": loi
							}
						}
					})
					.exec((err, updated) => {
			      		err ? reject(err)
			      			: resolve(updated);
			      	});
			})
		});
});

agreementsSchema.static('confirmation', (id:string, input:Object, files:Object, type:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(input)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}

		let typeDataLandlord = type+'.data.confirmation.landlord';
		let typeDataTenant = type+'.data.confirmation.tenant';
		let body:any = input;
		let file:any = files;
		let langlordFile = file.landlord;
		let tenantFile = file.tenant;

		if (langlordFile){
			Attachments.createAttachments(langlordFile).then(res => {
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

agreementsSchema.static('payment', (id:string, std:number, gfd:number, scd:number, remark:string, files:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {

		let file:any = files;
		let paymentFile = file.payment;

		var _payment = new Payments();
		_payment.type = "loi";
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
		},
		{
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
					"letter_of_intent.data.payment": paymentId
				}
			})
			.exec((err, updated) => {
	      		err ? reject(err)
	      			: resolve(updated);
	      	});	
	});
});

let Agreements = mongoose.model('Agreements', agreementsSchema);

export default Agreements;