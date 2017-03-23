import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import {report} from '../../../../global/report.service';
import * as fs from 'fs';
import Properties from '../../properties/dao/properties-dao';
import Agreements from '../../agreements/dao/agreements-dao';
import Developments from '../../developments/dao/developments-dao';
import Users from '../../users/dao/users-dao';
import * as juice from 'juice';

export class reportDAO{
	static reportLOI(id: string){
		return new Promise((resolve:Function, reject:Function) => {
			Agreements
				.findById(id, (err, agreement) =>{
					let loi = agreement.letter_of_intent.data;
					let loiStatus = loi.status;
					console.log(loiStatus);
					if (loiStatus == "admin-confirmation" || loiStatus == "landlord-confirmation") {
						reportDAO.reportLOIPending(id).then(res => {

							let result = juice(res);
							resolve(result);
							
						});
					}
					else if (loiStatus == "accepted") {
						reportDAO.reportLOIPrint(id).then(res => {

							let result = juice(res);
							resolve(result)
						});
					}
				})
		})
	}
	static reportLOIPending(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/pending-letterofintent-custom.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			Agreements
				.findById(id)
				.populate("landlord tenant")
				.populate({
					path: 'property',
					populate: {
						path: 'development',
						model: 'Developments',
						select: 'name'
					}
				})				
				.exec((err, agreement) => {
					let loi = agreement.letter_of_intent.data;
					let property = agreement.property;
					let landlord = agreement.landlord;
					let tenant = agreement.tenant;
					let tenant_sign;

					if (loi.confirmation.tenant.sign){
						tenant_sign = loi.confirmation.tenant.sign;
					}
					let data = {
						"form_data": {
							"created_at": loi.created_at,
							"monthly_rental": loi.monthly_rental,
							"gfd_amount": loi.gfd_amount,
							"sd_amount": loi.sd_amount,
							"security_deposit": loi.security_deposit,
							"lapse_offer": loi.lapse_offer,
							"term_lease": loi.term_lease,
							"term_lease_extend": loi.term_lease_extend,
							"date_commencement": loi.date_commencement,
							"term_payment": loi.term_payment,
							"requirements": loi.requirements,
							"property": {
								"development": property.development.name,
								"address": {
									"block_no": property.address.block_number,
									"street_name": property.address.street_name,
									"unit_no": property.address.floor,
									"unit_no_2": property.address.unit,
									"country": property.address.country,
									"postal_code": property.address.postal_code
								},
								"details": {
									"furnishing": property.details.furnishing
								}
							},		
							"tenant_sign": tenant_sign,					
							"tenant": {
								"name": tenant.tenant.data.name,
								"id_no": tenant.tenant.data.identification_number,
								"company_name": tenant.companies
							},
							// "payment_proof": payment
							"status": loi.status,
							"confirmation_date": loi.created_at
						}										
					};

					report.replaceCode(htmlString, data).then(res =>{
						resolve(res);
					});
				})			
		})		
	}
	
	static reportLOIComfirm(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/comfirm-letterofintent-custom.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			Agreements
				.findById(id, (err, agreement) => {
					let loi = agreement.letter_of_intent.data;					
					let data = {
					"form_data": {
						"status_sign": loi.status,
						"confirmation_date": loi.created_at
					}										
				};
				report.replaceCode(htmlString, data).then(res =>{
					resolve(res);
				});
			})
		})		
	}

	static reportLOIPrint(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/print-letterofintent.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			Agreements
				.findById(id)
				.populate("landlord tenant")
				.populate({
					path: 'property',
					populate: {
						path: 'development',
						model: 'Developments',
						select: 'name'
					}
				})
				.populate({
					path: 'letter_of_intent.data.payment',
					populate: {
						path: 'attachment.payment',
						model: 'Attachments',
						select: 'key'
					}
				})
				.exec((err, agreement) => {
					let loi = agreement.letter_of_intent.data;
					let property = agreement.property;
					let landlord = agreement.landlord;
					let tenant = agreement.tenant;
					let payment_proof = agreement.letter_of_intent.data.payment.attachment.payment.key
					let data = {
						"form_data": {
							"created_at": loi.created_at,
							"monthly_rental": loi.monthly_rental,
							"gfd_amount": loi.gfd_amount,
							"sd_amount": loi.sd_amount,
							"security_deposit": loi.security_deposit,
							"lapse_offer": loi.lapse_offer,
							"term_lease": loi.term_lease,
							"term_lease_extend": loi.term_lease_extend,
							"date_commencement": loi.confirmation.landlord.date,
							"term_payment": loi.term_payment,
							"requirements": loi.requirements,
							"property": {
								"development": property.development.name,
								"address": {
									"block_no": property.address.block_number,
									"street_name": property.address.street_name,
									"unit_no": property.address.floor,
									"unit_no_2": property.address.unit,
									"country": property.address.country,
									"postal_code": property.address.postal_code
								},
								"details": {
									"furnishing": property.details.furnishing
								}
							},
							"tenant_sign": loi.confirmation.tenant.sign,
							"tenant": {
								"name": tenant.tenant.data.name,
								"id_no": tenant.tenant.data.identification_number,
								"company_name": tenant.companies
							},

							"landlord_sign": loi.confirmation.landlord.sign,
							"landlord": {
								"full_name": landlord.landlord.data.name,
								"id_no": landlord.landlord.data.identification_number,
								"company_name": landlord.companies
							},
							"payment_proof": payment_proof,
							"status": loi.status,
							"confirmation_date": loi.created_at
						}										
					};

					report.replaceCode(htmlString, data).then(res =>{
						resolve(res);
					});
				})	
		})
					
	}

	static reportTA(id: string){
		return new Promise((resolve:Function, reject:Function) => {

			Agreements
				.findById(id, (err, agreement) =>{
					let ta = agreement.tenancy_agreement.data;
					let taStatus = ta.status;
					if (taStatus == "admin-confirmation" || taStatus == "landlord-confirmation") {
						reportDAO.reportTAPending(id).then(res => {
							let result = juice(res);
							resolve(result);
						});
					}
					else if (taStatus == "accepted") {
						reportDAO.reportTAPrint(id).then(res => {
							let result = juice(res);
							resolve(result);
						});
					}
				})
		})
	}
	static reportTAPending(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/pending-tenancyagreement-custom.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			Agreements
				.findById(id)
				.populate("landlord tenant letter_of_intent.data.landlord.bank_account.bank letter_of_intent.data.tenant.bank_account.bank")
				.populate({
					path: 'property',
					populate: {
						path: 'development',
						model: 'Developments',
						select: 'name'
					}
				})
				.exec((err, agreement) => {
					let loi = agreement.letter_of_intent.data;
					let ta = agreement.tenancy_agreement.data;
					let property = agreement.property;
					let landlord = agreement.landlord;
					let tenant = agreement.tenant;
					let statusSignTenant;
					console.log(loi)
					if (ta.confirmation.tenant.sign != null){
						statusSignTenant = "signed";
					}
					else if (ta.confirmation.tenant.sign == null){
						statusSignTenant = "not sign";
					}
					let data = {
						"form_data": {
							"date_ta": ta.created_at,
							"created_at": loi.created_at,
							"monthly_rental": loi.monthly_rental,
							"gfd_amount": loi.gfd_amount,
							"sd_amount": loi.sd_amount,
							"security_deposit": loi.security_deposit,
							"lapse_offer": loi.lapse_offer,
							"term_lease": loi.term_lease,
							"term_lease_extend": loi.term_lease_extend,
							"date_commencement": loi.date_commencement,
							"term_payment": loi.term_payment,
							"minor_repair_cost": loi.minor_repair_cost,
							"requirements": loi.requirements,
							"property": {
								"development": property.development.name,
								"address": {
									"block_no": property.address.block_number,
									"street_name": property.address.street_name,
									"unit_no": property.address.floor,
									"unit_no_2": property.address.unit,
									"country": property.address.country,
									"postal_code": property.address.postal_code
								},
								"details": {
									"furnishing": property.details.furnishing
								}
							},
							"tenant_sign": ta.confirmation.tenant.sign,
							"tenant": {
								"name": tenant.tenant.data.name,
								"id_no": tenant.tenant.data.identification_number,
								"company_name": tenant.companies
							},
							"landlord_account": {
								"name": loi.landlord.bank_account.name,
								"no": loi.landlord.bank_account.no,
								"bank": loi.landlord.bank_account.bank,
								"bank_code": loi.landlord.bank_account.bank.code
							},
							"status": loi.status,
							"confirmation_date": loi.created_at
						}										
					};
					report.replaceCode(htmlString, data).then(res =>{
						resolve(res);
					});
				})			
		})		
	}

	static reportTAPrint(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/print-tenancyagreement.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			Agreements
				.findById(id)
				.populate("landlord tenant letter_of_intent.data.landlord.bank_account.bank letter_of_intent.data.tenant.bank_account.bank")
				.populate({
					path: 'property',
					populate: {
						path: 'development',
						model: 'Developments',
						select: 'name'
					}
				})
				.exec((err, agreement) => {
					console.log(agreement);
					let loi = agreement.letter_of_intent.data;
					let ta = agreement.tenancy_agreement.data;
					let property = agreement.property;
					let landlord = agreement.landlord;
					let tenant = agreement.tenant;
					
					let createdAtTa = ta.created_at;
					let dateExpire = createdAtTa.setDate(createdAtTa.getDate() + 7);			

					console.log(createdAtTa);
					console.log(dateExpire);


					console.log (agreement);
					let data = {
						"form_data": {
							"created_at": loi.created_at,
							"monthly_rental": loi.monthly_rental,
							"gfd_amount": loi.gfd_amount,
							"sd_amount": loi.sd_amount,
							"security_deposit": loi.security_deposit,
							"lapse_offer": loi.lapse_offer,
							"term_lease": loi.term_lease,
							"term_lease_extend": loi.term_lease_extend,
							"date_commencement": loi.date_commencement,
							"term_payment": loi.term_payment,
							"requirements": loi.requirements,
							"date_expired": dateExpire,
							"property": {
								"development": property.development.name,
								"address": {
									"block_no": property.address.block_number,
									"street_name": property.address.street_name,
									"unit_no": property.address.floor,
									"unit_no_2": property.address.unit,
									"country": property.address.country,
									"postal_code": property.address.postal_code
								},
								"details": {
									"furnishing": property.details.furnishing
								}
							},
							"tenant_sign": ta.confirmation.tenant.sign,
							"tenant": {
								"name": tenant.tenant.data.name,
								"id_no": tenant.tenant.data.identification_number,
								"company_name": tenant.companies
							},

							"landlord_sign": ta.confirmation.landlord.sign,
							"landlord": {
								"full_name": landlord.landlord.data.name,
								"id_no": landlord.landlord.data.identification_number,
								"company_name": landlord.companies
							},
							"landlord_account": {
								"name": loi.landlord.bank_account.name,
								"no": loi.landlord.bank_account.no,
								"bank": loi.landlord.bank_account.bank.name,
								"bank_code": loi.landlord.bank_account.bank.code
							},
							"status": loi.status,
							"confirmation_date": loi.created_at
						}										
					};

					report.replaceCode(htmlString, data).then(res =>{
						resolve(res);
					});
				})	
		})
					
	}
}