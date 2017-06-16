import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import {report} from '../../../../global/report.service';
import * as fs from 'fs';
import * as phantom from 'phantom';
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
					if (err) {
						reject(err);
					}
					else if (agreement) {
						// let property = agreement.property;
						// let landlord = agreement.landlord; 
						// let tenant = agreement.tenant;
						// let loi = agreement.letter_of_intent.data;
						// let ta = agreement.tenancy_agreement.data;
						// let payment_proof;
						// let secpayment_proof;
						// let tenant_sign;
						// let landlord_sign;
						// let status;
						// let confirmation_date;
						// let date_expired;
						// let created_at;
						// let created_day;
						// let bank;
						// let bankCode;
						// let bankName;
						// let bankNo;
						// let landlordFullname;
						// let landlordIdNo;
						// if (landlord.landlord.data.name) {
						// 	landlordFullname = landlord.landlord.data.name;						
						// }
						// else {
						// 	landlordFullname = "Landlord";						
						// }
						// if (landlord.landlord.data.identification_number) {
						// 	landlordIdNo = landlord.landlord.data.identification_number;
						// }
						// else {
						// 	landlordIdNo = "-";
						// }
						// if (type == "loi"){
						// 	tenant_sign = loi.confirmation.tenant.sign;
						// 	landlord_sign = loi.confirmation.landlord.sign;
						// 	status = loi.status;
						// 	confirmation_date = loi.confirmation.landlord.date;
						// 	created_day = loi.created_at;
						// 	created_at = new Date(loi.created_at);
						// 	date_expired = new Date(created_at.setDate(created_at.getDate() + 6));
						// 	if(loi.payment){
						// 		payment_proof = loi.payment.attachment.payment;
						// 	}						
						// 	if(loi.landlord.bank_account.no && loi.landlord.bank_account.bank){
						// 		bankName = loi.landlord.bank_account.name,
						// 		bankNo = loi.landlord.bank_account.no,
						// 		bank = loi.landlord.bank_account.bank.name,								
						// 		bankCode = loi.landlord.bank_account.bank.code
						// 	}
						// 	else if (loi.landlord.bank_account.no){
						// 		bankName = "",
						// 		bankNo = "",
						// 		bank = "",								
						// 		bankCode = ""
						// 	}
						// }
						// else if (type == "ta"){
						// 	tenant_sign = ta.confirmation.tenant.sign;
						// 	landlord_sign = ta.confirmation.landlord.sign;
						// 	status = ta.status;
						// 	confirmation_date = ta.confirmation.landlord.date;
						// 	created_day = ta.created_at;
						// 	created_at = new Date(ta.created_at);
						// 	date_expired = new Date(created_at.setDate(created_at.getDate() + 7));
						// 	if (ta.payment) {
						// 		secpayment_proof = ta.payment.attachment.payment;
						// 	}	
						// 	if (loi.landlord.bank_account.no && loi.landlord.bank_account.bank) {
						// 		bankName = loi.landlord.bank_account.name
						// 		bankNo = loi.landlord.bank_account.no,
						// 		bank = loi.landlord.bank_account.bank.name,								
						// 		bankCode = loi.landlord.bank_account.bank.code
						// 	}
						// 	else if (loi.landlord.bank_account.no){
						// 		bankName = "",
						// 		bankNo = "",
						// 		bank = "",								
						// 		bankCode = ""
						// 	}					
						// }
						// let devName;
						// if (property.development.name) {
						// 	devName = property.development.name;
						// }		
						// else {
						// 	devName = "Development Not Found";
						// }	
						let developmentName = "";	
						let unit = "";
						let unit2 = "";
						let blokNo = "";
						let streetName = "";
						let postalCode = "";
						let coordinates = [];
						let country = "";
						let fullAddress = "";
						let typeAddress = "";
						let pictureLiving = [];
						let pictureDining = [];
						let pictureBed = [];
						let pictureToilet = [];
						let pictureKitchen = [];
						let favorite = false;
						let amenities = [];
						let detailsSize = 0;
						let detailsSizeSqm = 0;
						let detailsBedroom = 0;
						let detailsBathrom = 0;
						let detailsPrice = 0;
						let detailsPsqft = 0;
						let detailsAvailable = "";
						let detailsFurnishing = "";
						let detailsDescription = "";
						let detailsType = "";
						let occupantsId = "";
						let occupantsName = "";
						let tenantId = "";
						let tenantName = "";
						let requirements = [];
						let tenantSign = "";
						let paymentProof = "";
						let secPaymentProof = "";
						let landlordSign = "";
						let landlordId = "";
						let landlordName = "";
						let landlordCompany = "";
						let landlordBank = "";
						let landlordBankName = "";
						let landlordBankNo = "";
						let landlordBankCode = "";
						let monthlyRental = 0;
						let gfd = 0;
						let sd = 0;
						let scd = 0;
						let lapseOffer = 0;
						let termLease = 0;
						let termLeaseExtend = 0;
						let dateCommencement = "";
						let termPayment = "";
						let minorRepairCost = "";
						let statusSign = "accept";
						let status = "";
						let confirmationDate = "";
						let dateTa;
						let dateExpired;
						let createdAt = "";
						let occupants = [];
						if (agreement.property) {
							let property = agreement.property;
							if (property.development.name) {
								developmentName = property.development.name;
							}		
							else {
								developmentName = "Development Not Found";
							}
							unit = property.address.floor;
							unit2 = property.address.unit;
							blokNo = property.address.block_number;
							streetName = property.address.street_name;
							postalCode = property.address.postal_code;
							coordinates = [Number(property.address.coordinates[0]) , Number(property.address.coordinates[1])];
							country = property.address.country;
							fullAddress = property.address.full_address;
							typeAddress = property.address.type;
							detailsSize = property.details.size_sqf;	
							detailsSizeSqm = property.details.size_sqm;
							detailsBedroom = property.details.bedroom;
							detailsBathrom = property.details.bathroom;				
							detailsPrice = property.details.price;
							detailsPsqft = property.details.psqft;
							detailsAvailable = property.details.available;
							detailsFurnishing = property.details.furnishing;
							detailsDescription = property.details.description;
							detailsType = property.details.type;
						}
						if (agreement.letter_of_intent.data) {
							let loi = agreement.letter_of_intent.data;
							if (loi.landlord.bank_account.no && loi.landlord.bank_account.bank) {
								landlordBankName = loi.landlord.bank_account.name
								landlordBankNo = loi.landlord.bank_account.no,
								landlordBank = loi.landlord.bank_account.bank.name,								
								landlordBankCode = loi.landlord.bank_account.bank.code
							}
							if (loi.occupiers.length > 0) {
								for (var k = 0; k < loi.occupiers.length; k++) {
									let occup = loi.occupiers[k];
									let data = {
										name : occup.name,
										id_no : occup.identification_number
									}
									occupants.push(data);
								}
							}
							requirements = loi.requirements;
							monthlyRental = loi.monthly_rental;
							termLease = loi.term_lease;
							dateCommencement = loi.date_commencement;
							gfd = loi.gfd_amount;
							sd = loi.sd_amount;
							scd = loi.security_deposit;
							termPayment = loi.term_payment;
							minorRepairCost = loi.minor_repair_cost;
							lapseOffer = loi.lapse_offer;
							termLeaseExtend = loi.term_lease_extend;							
						}
						if (agreement.landlord.landlord.data) {
							landlordName = agreement.landlord.landlord.data.name;	
							landlordId =  agreement.landlord.landlord.data.identification_number; 
							landlordCompany = agreement.landlord.companies;					
						}
						if (agreement.tenant.tenant.data) {
							tenantName = agreement.tenant.tenant.data.name;	
							tenantId =  agreement.tenant.tenant.data.identification_number; 		
						}
						if (type == 'loi') {
							tenantSign = agreement.letter_of_intent.data.confirmation.tenant.sign;
							landlordSign = agreement.letter_of_intent.data.confirmation.tenant.sign;
							createdAt = agreement.letter_of_intent.data.created_at;
							let created_at = new Date(agreement.letter_of_intent.data.createdAt);
							dateExpired = new Date(created_at.setDate(created_at.getDate() + 7));
							if(agreement.letter_of_intent.data.payment){
								paymentProof = agreement.letter_of_intent.data.payment.attachment.payment;
							}
						}
						if (type == 'ta') {
							tenantSign = agreement.tenancy_agreement.data.confirmation.tenant.sign;
							landlordSign = agreement.tenancy_agreement.data.confirmation.tenant.sign;
							createdAt = agreement.tenancy_agreement.data.created_at;
							let created_at = new Date(agreement.tenancy_agreement.data.createdAt);
							dateExpired = new Date(created_at.setDate(created_at.getDate() + 7));
							if(agreement.tenancy_agreement.data.payment){
								secPaymentProof = agreement.tenancy_agreement.data.payment.attachment.payment;
							}
							dateTa = created_at;
						}
						var data = {
							"property": {
								"development": developmentName,
								"address": {
									"unit_no": unit,
									"unit_no_2": unit2,
									"block_no": blokNo,
									"street_name": streetName,
									"postal_code": postalCode,
									"coordinates": coordinates,
									"country": country,
									"full_address": fullAddress,
									"type": typeAddress
								},
								"details": {
									"size": detailsSize,
									"size_sqm": detailsSizeSqm,
									"bedroom": detailsBedroom,
									"bathroom": detailsBathrom,
									"price": detailsPrice,
									"psqft": detailsPsqft,
									"available": detailsAvailable,
									"furnishing": detailsFurnishing,
									"description": detailsDescription,
									"type": detailsType
								},
							},
							"form_data":{
								"property": {
									"development": developmentName,
									"address": {
										"unit_no": unit,
										"unit_no_2": unit2,
										"block_no": blokNo,
										"street_name": streetName,
										"postal_code": postalCode,
										"coordinates": coordinates,
										"country": country,
										"full_address": fullAddress,
										"type": typeAddress
									},
									"details": {
										"size": detailsSize,
										"size_sqm": detailsSizeSqm,
										"bedroom": detailsBedroom,
										"bathroom": detailsBathrom,
										"price": detailsPrice,
										"psqft": detailsPsqft,
										"available": detailsAvailable,
										"furnishing": detailsFurnishing,
										"description": detailsDescription,
										"type": detailsType
									},
								},
								"occupants": {
									"name": occupantsName,
									"id_no": occupantsId
								},
								"tenant": {
									"name": tenantName,
									"id_no": tenantId
								},
								"requirements": requirements,							
								"tenant_sign": tenantSign,
								"payment_proof": paymentProof,
								"second_payment_proof": secPaymentProof,
								"landlord_sign": landlordSign,
								"monthly_rental": monthlyRental,
								"gfd_amount": gfd,
								"sd_amount": sd,
								"security_deposit": scd,
								"lapse_offer": lapseOffer,
								"term_lease": termLease,
								"term_lease_extend": termLeaseExtend,
								"date_commencement": dateCommencement,
								"term_payment": termPayment,
								"minor_repair_cost": minorRepairCost,
								"status_sign": statusSign,
								"status": status,
								"confirmation_date": confirmationDate,							
								"landlord":{
									"full_name": landlordName, 
									"id_number": landlordId,
									"company_name": landlordCompany
								},
								"landlord_account": {								
									"name": landlordBankName,
									"no": landlordBankNo,
									"bank": landlordBank,								
									"bank_code": landlordBankCode
								},
								"date_ta": dateTa,
								"date_expired": dateExpired,
								"created_at": createdAt
							}
						}
					}
					else {
						reject({message: "Agreement not found"})
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
						if (loiStatus == "pending" ||loiStatus == "draft" || loiStatus == "payment-confirmed" || loiStatus == "rejected" || loiStatus == "expired") {
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
						reject({message: err.message});
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
						else if (taStatus == "accepted" || taStatus == "admin-confirmation" || taStatus == "rejected" || taStatus == "expired") {
							reportDAO.reportTAPrint(id).then(res => {
								let result = juice(res);
								resolve(res);
							});
						}
					}
					else if(err){
						reject({message: err.message});
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

	static printReport(id:string, data:Object){
		return new Promise((resolve:Function, reject:Function) => {
			let body:any = data;
			let type = body.type;
			let report;
			if (type == "loi") {
				this.reportLOIPrint(id)
					.then(res => {
						let namedata = "letter_of_intent"+id+".pdf"
						var options = {
							"directory": "/tmp",
							"format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid 
  							"orientation": "portrait",
							"border": {
								"top": "2cm",            // default is 0, units: mm, cm, in, px 
								"right": "1cm",
								"bottom": "2cm",
								"left": "1.5cm"
							},
						};
						
						pdf.create(res, options , (err, buffer) => {
							if (err) return console.log(err);
							console.log(buffer);
							resolve(buffer);
						});

						// pdf.create(res, options).toFile('./test.pdf', function(err, res) {
						// if (err) return console.log(err);
						// 	console.log(res); // { filename: '/app/businesscard.pdf' } 
						// 	resolve(res.filename);
						// });
					})
			}
			else if (type == "ta") {
				this.reportTAPrint(id)
					.then(res => {
						let namedata = "tenancy_agreement"+id+".pdf"
						var options = {
							"directory": "/tmp",
							"format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid 
  							"orientation": "portrait",
							"border": {
								"top": "2cm",            // default is 0, units: mm, cm, in, px 
								"right": "1cm",
								"bottom": "2cm",
								"left": "1.5cm"
							},
						};
						
						pdf.create(res, options , (err, buffer) => {
							if (err) return console.log(err);
							console.log(buffer);
							resolve(buffer);
						});
					})
			}					
		})					
	}
}