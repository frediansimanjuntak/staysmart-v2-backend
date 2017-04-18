import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import {report} from '../../../../global/report.service';
import * as fs from 'fs';
// import * as pdf from 'html-pdf';
import Properties from '../../properties/dao/properties-dao';
import Agreements from '../../agreements/dao/agreements-dao';
import Developments from '../../developments/dao/developments-dao';
import Users from '../../users/dao/users-dao';
import * as juice from 'juice';

var pdf = require('html-pdf');

export class reportDAO{
	static ReportData(id:string, type:string){
		return new Promise((resolve:Function, reject:Function) => {
			if (!_.isString(id)) {
				return reject(new TypeError('Id is not a valid string.'));
			}
			Agreements
				.findById(id)
				.populate("landlord tenant appointment letter_of_intent.data.tenant.bank_account.bank letter_of_intent.data.landlord.bank_account.bank")
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
					populate: [{
						path: 'attachment.payment',
						model: 'Attachments',
					},
					{
						path: 'attachment.payment_confirm',
						model: 'Attachments'					
					}]
				})
				.populate({
					path: 'tenancy_agreement.data.payment',
					populate: [{
						path: 'attachment.payment',
						model: 'Attachments',
					},
					{
						path: 'attachment.payment_confirm',
						model: 'Attachments'					
					}]
				})
				.exec((err, agreement) => {
					let property = agreement.property;
					let landlord = agreement.landlord;
					let tenant = agreement.tenant;
					let loi = agreement.letter_of_intent.data;
					let ta = agreement.tenancy_agreement.data;
					let payment_proof;
					let secpayment_proof;
					let tenant_sign;
					let landlord_sign;
					let status;
					let confirmation_date;
					let date_expired;
					let created_at;
					let created_day;
					let bank;
					let bankCode;
					let bankName;
					let bankNo;
					if (type == "loi"){
						tenant_sign = loi.confirmation.tenant.sign;
						landlord_sign = loi.confirmation.landlord.sign;
						status = loi.status;
						confirmation_date = loi.confirmation.landlord.date;
						created_day = loi.created_at;
						created_at = new Date(loi.created_at);
						date_expired = new Date(created_at.setDate(created_at.getDate() + 7));
						if(loi.payment){
							payment_proof = loi.payment.attachment.payment;
							secpayment_proof = loi.payment.attachment.payment_confirm;
						}						
						if(loi.landlord.bank_account.no){
							bankName = loi.landlord.bank_account.name,
							bankNo = loi.landlord.bank_account.no,
							bank = loi.landlord.bank_account.bank.name,								
							bankCode = loi.landlord.bank_account.bank.code
						}
						else if (loi.landlord.bank_account.no){
							bankName = "",
							bankNo = "",
							bank = "",								
							bankCode = ""
						}
					}
					else if (type == "ta"){
						tenant_sign = ta.confirmation.tenant.sign;
						landlord_sign = ta.confirmation.landlord.sign;
						status = ta.status;
						confirmation_date = ta.confirmation.landlord.date;
						created_day = ta.created_at;
						created_at = new Date(ta.created_at);
						date_expired = new Date(created_at.setDate(created_at.getDate() + 7));
						if(ta.payment){
							payment_proof = ta.payment.attachment.payment;
							secpayment_proof = ta.payment.attachment.payment_confirm;
						}	
						if(loi.landlord.bank_account.no){
							bankName = loi.landlord.bank_account.name,
							bankNo = loi.landlord.bank_account.no,
							bank = loi.landlord.bank_account.bank.name,								
							bankCode = loi.landlord.bank_account.bank.code
						}
						else if (loi.landlord.bank_account.no){
							bankName = "",
							bankNo = "",
							bank = "",								
							bankCode = ""
						}					
					}				
					console.log(property.development._id);

					var data = {
						"property": {
							"development": property.development._id,
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
						"form_data":{
							"property": {
								"development": property.development._id,
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
							"occupants": {
								"name": loi.occupiers.name,
								"id_no": loi.occupiers.identification_number
							},
							"tenant": {
								"name": tenant.tenant.data.name,
								"id_no": tenant.tenant.data.identification_number,
								"company_name": tenant.companies
							},
							"requirements": loi.requirements,							
							"tenant_sign": tenant_sign,
							"payment_proof": payment_proof,
							"second_payment_proof": secpayment_proof,
							"landlord_sign": landlord_sign,
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
							"status_sign": "accept",
							"status": status,
							"confirmation_date": confirmation_date,							
							"landlord":{
								"full_name": landlord.landlord.data.name,
								"id_number": landlord.landlord.data.identification_number,
								"company_name": landlord.companies
							},
							"landlord_account": {								
								"name": bankName,
								"no": bankNo,
								"bank": bank,								
								"bank_code": bankCode
							},
							"date_ta": ta.created_at,
							"date_expired": date_expired,
							"created_at":created_day
						}
					}
					if(err){
						reject(err);
					}
					else if(agreement){
						resolve(data);
					}
				})
		})
	}

	static reportLOI(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			Agreements
				.findById(id, (err, agreement) =>{
					if(agreement){
						let loi = agreement.letter_of_intent.data;
						let loiStatus = loi.status;
						if (loiStatus == "pending" ||loiStatus == "draft" || loiStatus == "payment-confirmed") {
							reportDAO.reportLOIPending(id).then(res => {
								let result = juice(res);
								resolve(res);	
								
							});
						}
						else if (loiStatus == "accepted") {
							reportDAO.reportLOIFinish(id).then(res => {
								let result = juice(res);
								resolve(res);
							});
						}
					}					
					else if(err){
						reject(err);
					}
				})
		})
	}
	static reportLOIPending(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = __dirname + '/../../../../../server/template/report-template/pending-letterofintent-custom.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			let type = "loi";
			reportDAO.ReportData(id, type).then(result => {
				let data = result;
				report.replaceCode(htmlString, data).then(res =>{
						resolve(res);
					});
			})	
		})		
	}
	
	static reportLOIComfirm(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = __dirname + '/../../../../../server/template/report-template/comfirm-letterofintent-custom.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			let type = "loi";
			reportDAO.ReportData(id, type).then(result => {
				let data = result;
				report.replaceCode(htmlString, data).then(res =>{
						resolve(res);
					});
			})
		})		
	}

	static reportLOIFinish(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = __dirname + '/../../../../../server/template/report-template/comfirm-letterofintent-ckeditor.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			let type = "loi";
			reportDAO.ReportData(id, type).then(result => {
				let data = result;
				report.replaceCode(htmlString, data).then(res =>{
						resolve(res);
					});
			})	
		})					
	}

	static reportLOIPrint(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = __dirname + '/../../../../../server/template/report-template/print-letterofintent.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			let type = "loi";
			reportDAO.ReportData(id, type).then(result => {
				let data = result;
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
					if(agreement){
						let ta = agreement.tenancy_agreement.data;
						let taStatus = ta.status;
						if (taStatus == "pending") {
							reportDAO.reportTAPending(id).then(res => {
								let result = juice(res);
								resolve(res);
							});
						}
						else if (taStatus == "accepted" || taStatus == "admin-confirmation") {
							reportDAO.reportTAPrint(id).then(res => {
								let result = juice(res);
								resolve(res);
							});
						}
					}
					else if(err){
						reject(err);
					}					
				})
		})
	}
	static reportTAPending(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = __dirname + '/../../../../../server/template/report-template/pending-tenancyagreement-custom.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			let type = "ta";
			reportDAO.ReportData(id, type).then(result => {
				let data = result;
				report.replaceCode(htmlString, data).then(res =>{
						resolve(res);						
					});
			})			
		})		
	}

	static reportTAPrint(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = __dirname + '/../../../../../server/template/report-template/print-tenancyagreement.html'
			var htmlString = fs.readFileSync(reportHtml).toString();

			let type = "ta";
			reportDAO.ReportData(id, type).then(result => {
				let data = result;
				report.replaceCode(htmlString, data).then(res =>{
						resolve(res);
					});
			})	
		})					
	}

	static printReport(data:Object){
		return new Promise((resolve:Function, reject:Function) => {
			let body:any = data;
			let report = body.report;
			let pdfName = body.pdf_name;
			let html = report;
			var options = { 
				"format": "A4",
				"border": {
					"top": "2cm",
					"right": "2cm",
					"bottom": "2cm",
					"left": "2cm"
					}
				};

			pdf.create(html, options).toFile('./'+pdfName+'.pdf', function(err, res) {
			  if (err) return console.log(err);
			  resolve(res);
			  console.log(res); 
			});	
		})					
	}
}