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

	static blogComment(emailTo, blogTitle, url){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Blog Comment';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+emailTo+',<br><br><p style="align:justify;">Thank you for your comment on "'+blogTitle+'"</p><p style="align:justify;">You can view your comment <a target="_blank" href="'+url+'">here</a>. </p>Thanks,<br>Staysmart Team</body></html>';
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

	static confirmAppointment(emailTo, fullname, full_address, landlord_username, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Confirm Appointment';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+fullname+',<br><br><p style="align:justify;">Your appointment request for the property situated at '+full_address+' has been confirmed by '+landlord_username+'.</p><p style="align:justify;">Please login to www.staysmart.sg to view the details of the appointment.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team</body></html>';
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

	static submitProperty(emailTo, full_name, full_address, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Listing Submitted';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta charset="utf-8"> <title></title> </head> <body> Hi '+full_name+', <br><br><p style="align:justify;">Your listing for the property situated at '+full_address+' is currently being reviewed by our team of hardworking administrators.</p><p style="align:justify;">Please allow 1 - 3 business days to process your submission.</p><p style="align:justify;">In the meantime if you have any queries, do feel free to contact us at '+from+'.</p><br><br>Thanks,<br>Staysmart Team </body></html>';
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

	static rejectProperty(emailTo, full_name, full_address, from){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Listing Submitted';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta charset="utf-8"> <title></title> </head> <body> Hi '+full_name+', <br><br><p style="align:justify;">We regret to inform you that your listing for the property situated at '+full_address+' has been unsuccessful.</p><p style="align:justify;">We would like to reach out to you and help change the status of this listing into a successful one. Please contact us at '+from+'.</p><br><br>Sincerely,<br>Staysmart Team </body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}
}