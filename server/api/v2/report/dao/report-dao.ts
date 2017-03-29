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
				.populate("landlord tenant appointment letter_of_intent.data.landlord.bank_account.bank")
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
						model: 'Attachments'
					}
				})
				.exec((err, agreement) => {
					// console.log(agreement)
					let property = agreement.property;
					let landlord = agreement.landlord;
					let tenant = agreement.tenant;
					let loi = agreement.letter_of_intent.data;
					let ta = agreement.tenancy_agreement.data;
					let payment_proof;
					console.log(payment_proof);
					let tenant_sign;
					let landlord_sign;
					let status;
					let confirmation_date;
					let date_expired;
					let created_at;
					if (type == "loi"){
						tenant_sign = loi.confirmation.tenant.sign;
						landlord_sign = loi.confirmation.landlord.sign;
						status = loi.status;
						confirmation_date = loi.confirmation.landlord.date;
						created_at = new Date(loi.created_at);
						date_expired = new Date(created_at.setDate(created_at.getDate() + 7));
						payment_proof = loi.payment.attachment.payment;

					}
					else if (type == "ta"){
						tenant_sign = ta.confirmation.tenant.sign;
						landlord_sign = ta.confirmation.landlord.sign;
						status = ta.status;
						confirmation_date = ta.confirmation.landlord.date;
						created_at = new Date(loi.created_at);
						date_expired = new Date(created_at.setDate(created_at.getDate() + 7));
						payment_proof = ta.payment.attachment.payment;
					}				

					var data = {
						"form_data":{
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
							"landlord":{
								"full_name": landlord.landlord.data.name,
								"id_number": landlord.landlord.data.identification_number,
								"company_name": landlord.companies
							},
							"landlord_account": {								
								"name": loi.landlord.bank_account.name,
								"no": loi.landlord.bank_account.no,
								"bank": loi.landlord.bank_account.bank.name,
								"bank_code": loi.landlord.bank_account.bank.code
							},
							"date_ta": ta.created_at,
							"date_expired": date_expired
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
					let loi = agreement.letter_of_intent.data;
					let loiStatus = loi.status;
					console.log(loiStatus);
					if (loiStatus == "admin-confirmation" || loiStatus == "landlord-confirmation") {
						reportDAO.reportLOIPending(id).then(res => {
							let result = juice(res);
							resolve(res);
							
						});
					}
					else if (loiStatus == "accepted") {
						reportDAO.reportLOIPrint(id).then(res => {
							let result = juice(res);
							resolve(res)
						});
					}
				})
		})
	}
	static reportLOIPending(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/pending-letterofintent-custom.html'
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
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/comfirm-letterofintent-custom.html'
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
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/print-letterofintent.html'
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
					let ta = agreement.tenancy_agreement.data;
					let taStatus = ta.status;
					if (taStatus == "admin-confirmation" || taStatus == "landlord-confirmation") {
						reportDAO.reportTAPending(id).then(res => {
							let result = juice(res);
							resolve(res);
						});
					}
					else if (taStatus == "accepted") {
						reportDAO.reportTAPrint(id).then(res => {
							let result = juice(res);
							resolve(res);
						});
					}
				})
		})
	}
	static reportTAPending(id:string){
		return new Promise((resolve:Function, reject:Function) => {
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/pending-tenancyagreement-custom.html'
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
			let reportHtml = 'c:/repositories/staysmart-v2-backend/server/template/report-template/print-tenancyagreement.html'
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
			// let htmlcode = 'c:/repositories/staysmart-v2-backend/server/template/report-template/pending-tenancyagreement-custom.html'
			// var html = fs.readFileSync(htmlcode, 'utf8');
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