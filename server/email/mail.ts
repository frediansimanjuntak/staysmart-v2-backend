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

	static blogComment(emailTo, blogTitle, url){
		return new Promise((resolve:Function, reject:Function) => {
			var emailSubject = 'Blog Comment';
			var content = '<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8"><title></title></head><body>Hi '+emailTo+',<br><br><p style="align:justify;">Thank you for your comment on "'+blogTitle+'"</p><p style="align:justify;">You can view your comment <a target="_blank" href="'+url+'">here</a>. </p>Thanks,<br>Staysmart Team</body></html>';
			EmailService.sendEmail(emailTo, emailSubject, content).then(res => {
				resolve(res);
			});	
		})
	}
}