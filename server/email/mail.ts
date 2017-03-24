'use strict';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import config from '../config/environment/index';
import {EmailService} from '../global/email.service';

export class mail{
	static signUp(emailTo, fullname, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Sign Up';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+fullname+',<p style="align:justify;">Welcome to Staysmart!</p><p style="align:justify;">Thank you for joining us in our journey to provide an alternate holistic platform where tenants and landlords can communicate and transact with one another directly.</p><p style="align:justify;">We are currently working on a series of exciting enhancements that we will be rolling out in due course to better serve you.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static resetPassword(emailTo, fullname, url, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Reset Password';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+fullname+',<br><br><p style="align:justify">We received a request from you to reset your password. To reset your password please click <a href="'+url+'">link.</a></p><p style="align:justify">If you did not request for the reset of your password, please ignore this email.</p><p style="align:justify">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static blogUpdate(emailTo, blogTitle){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Blog Updated';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta charset="utf-8"> <title></title> </head> <body> Hi '+emailTo+', <br><br><p style="align:justify;">Thanks you for subscribing Staysmart Blog</p><p style="align:justify;">Blog '+blogTitle+' is update</p><p style="align:justify;">For more details view the blog.</p><br><br>Thanks,<br>Staysmart Team </body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static initiateLOI(emailTo, fullname, tenant_username, fulladdress, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Initiate Letter of Intent';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+fullname+',<br><br><p style="align:justify;"> Congratulations! You have received a Letter of Intent (LOI) from '+tenant_username+' for the property situated at '+fulladdress+'.</p><p style="align:justify;">Please login to Staysmart to view the details of the LOI for your acceptance.</p><br><br><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static blogComment(emailTo, blogTitle, url){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Blog Comment';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+emailTo+',<br><br><p style="align:justify;">Thank you for your comment on "'+blogTitle+'"</p><p style="align:justify;">You can view your comment <a target="_blank" href="'+url+'">here</a>. </p>Thanks,<br>Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static acceptedLoiLandlord(emailTo, fullname, landlord_username, fulladdress, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Accepted Letter of Intent';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+fullname+',<br><br><p style="align:justify;">Congratulations! Your Letter of Intent (LOI) for the property situated at '+fulladdress+' has been accepted by '+landlord_username+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the LOI.</p><P style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static proposedAppointment(emailTo, fullname, tenant_username, full_address, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Proposed Appointment';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta charset="utf-8"> <title></title> </head> <body> Hi '+fullname+', <br><br><p style="align:justify;">You have received an appointment request from '+tenant_username+' for the property situated at '+full_address+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the appointment for your confirmation.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team </body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static expiredLoiLandlord(emailTo, fullname, fulladdress, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Accepted Letter of Intent';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta charset="utf-8"> <title></title> </head> <body> Hi '+fullname+', <br><br><p style="align:justify;">We regret to inform you that your Letter of Intent (LOI) for the property situated at '+fulladdress+' has been expired.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the LOI.</p><P style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team </body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static confirmAppointment(emailTo, fullname, full_address, landlord_username, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Confirm Appointment';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+fullname+',<br><br><p style="align:justify;">Your appointment request for the property situated at '+full_address+' has been confirmed by '+landlord_username+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the appointment.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}
	
	static acceptLoiPayment(emailTo, fullname, fulladdress, acceptedBy, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Accepted Payment Letter of Intent';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+',<br><br><p style="align:justify;">Congratulations! Good Faith Deposit (GFD) Payment for the property situated at '+fulladdress+' has been received by '+acceptedBy+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static rejectAppointment(emailTo, fullname, full_address, landlord_username, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Reject Appointment';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+fullname+',<br><br><p style="align:justify;">Your appointment request for the property situated at '+full_address+' has been rejected by '+landlord_username+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the appointment.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static rejectLoiPayment(emailTo, fullname, fulladdress, rejectedBy, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Reject Payment Letter of Intent';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+',<br><br><p style="align:justify;">Good Faith Deposit (GFD) Payment for the property situated at '+fulladdress+' has been rejected by '+rejectedBy+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static submitProperty(emailTo, full_name, full_address, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Listing Submitted';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta charset="utf-8"> <title></title> </head> <body> Hi '+full_name+', <br><br><p style="align:justify;">Your listing for the property situated at '+full_address+' is currently being reviewed by our team of hardworking administrators.</p><p style="align:justify;">Please allow 1 - 3 business days to process your submission.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team </body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}
	static rejectLoiLandlord(emailTo, fullname, landlord_username, fulladdress, rejectedBy, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Reject Letter of Intent';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+',<br><br><p style="align:justify;">We regret to inform you that your Letter of Intent (LOI) for the property situated at '+fulladdress+' has been rejected by '+landlord_username+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the LOI.</p><P style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static approveProperty(emailTo, full_name, full_address, url, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Listing Submitted';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta charset="utf-8"> <title></title> </head> <body> Hi '+full_name+', <br><br><p style="align:justify;">We are pleased to inform you that your listing for the property situated at '+full_address+' has been approved!</p><p style="align:justify;">With the listing approved, it will now be visible on Staysmart. You can check out your listing <a target="_blank" href="'+url+'">here</a>.</p><p style="align:justify;">We hope you’ll be able to find a tenant for the property soon.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Congratulations,<br>Staysmart Team </body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static initiateTaLandlord(emailTo, fullname, landlord_username, fulladdress, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Initiate Tenantcy Agreement';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+', <br><br><p style="align:justify;">You have received a Tenancy Agreement (TA) from '+landlord_username+' for the property situated at '+fulladdress+' </p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the TA for your acceptance.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static rejectProperty(emailTo, full_name, full_address, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Listing Submitted';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta charset="utf-8"> <title></title> </head> <body> Hi '+full_name+', <br><br><p style="align:justify;">We regret to inform you that your listing for the property situated at '+full_address+' has been unsuccessful.</p><p style="align:justify;">We would like to reach out to you and help change the status of this listing into a successful one. Please contact us at '+from+'.</p><br><br>Sincerely,<br>Staysmart Team </body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static initiateTaTenant(emailTo, fullname, tenant_username, fulladdress, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Initiate Tenantcy Agreement';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+',<br><br><p style="align:justify;">You have received a Tenancy Agreement (TA) from '+tenant_username+' for the property situated at '+fulladdress+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the TA for your acceptance.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static acceptTa(emailTo, fullname, fulladdress, accepted_by, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Accepted Tenancy Agreement';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+',<br><br><p style="align:justify;">Congratulations! The Tenancy Agreement (TA) for the property situated at '+fulladdress+' has been accepted by '+accepted_by+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the revised TA.</p><p style="align:justify;">With the TA agreed by both parties, the lease for the property situated at '+fulladdress+' is now in force. A copy of the stamp certificate for the TA will be provided in due course and can be accessible in your account on Staysmart.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static expiredTa(emailTo, fullname, fulladdress, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Accepted Tenancy Agreement';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+',<br><br><p style="align:justify;">We regret to inform you that the Tenancy Agreement (TA) for the property situated at '+fulladdress+' has been expired.</p><p style="align:justify;">Please feel free to contact us at '+from+' if you require any assistance.</p><br><br>Sincerely,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static acceptTaPayment(emailTo, fullname, fulladdress, accepted_by, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Accepted Payment Tenancy Agreement';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+',<br><br><p style="align:justify;">Congratulations! Security Deposit (SD) Payment for the property situated at '+fulladdress+' has been received by '+accepted_by+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static rejectTaPayment(emailTo, fullname, fulladdress, accepted_by, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Reject Payment Tenancy Agreement';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+',<br><br><p style="align:justify;">Congratulations! Security Deposit (SD) Payment for the property situated at '+fulladdress+' has been received by '+accepted_by+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static rejectTa(emailTo, fullname, fulladdress, rejectedby, tenantplace, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Reject Payment Tenancy Agreement';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+fullname+',<br><br><p style="align:justify;">We regret to inform you that the Tenancy Agreement (TA) for the property situated at '+fulladdress+' has rejected by '+rejectedby+'.</p><p style="align:justify;">We hope you will find a new '+ tenantplace+' soon.</p><p style="align:justify;">Please feel free to contact us at '+from+' if you require any assistance.</p><br><br>Sincerely,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static createInventory(emailTo, tenant_username, landlord_username, full_address, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Receive Inventory List';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+tenant_username+',<br><br><p style="align:justify;"> Congratulations! You have received a Inventory List from '+landlord_username+' for the property situated at '+full_address+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the Inventory List for your acceptance.</p><br><br><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static updateInventory(emailTo, tenant_username, landlord_username, full_address, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Updated Inventory List';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta charset="utf-8"> <title></title> </head> <body> Hi '+tenant_username+', <br><br><p style="align:justify;">'+landlord_username+' has Updated Inventory List for the property situated at '+full_address+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the Inventory List for your acceptance.</p><br><br><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team </body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}

	static confirmInventory(emailTo, tenant_username, landlord_username, full_address, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Confirmation Inventory List';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body> Hi '+landlord_username+',<br><br><p style="align:justify;">Congratulations! Your Inventory List for the property situated at '+full_address+' has been accepted by '+tenant_username+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the Inventory List for your acceptance.</p><br><br><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br> Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}
}