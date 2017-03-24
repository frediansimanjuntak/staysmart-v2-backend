'use strict';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import config from '../config/environment/index';
import {GlobalService} from './global.service';

// Access https://github.com/bojand/mailgun-js for documentation
var mailgun = require('mailgun-js')({ apiKey: config.mailgun.apiKey, domain: config.mailgun.domain });

export class EmailConfig {
  static init():void {
    let _root = process.cwd();
  }
}

export class EmailService {
  static sendEmail(emailTo:string, emailSubject:string, emailText:string) {
    return new Promise((resolve:Function, reject:Function) => {
      if (!GlobalService.validateEmail(emailTo))
        reject(new TypeError('Destination email is not a valid email.'))
      var data = {
        from: 'Staysmart Revamp <noreply@staysmart.com.sg>',
        to: emailTo,
        subject: emailSubject,
        html: emailText
      };

      mailgun.messages().send(data, function (error, body) {
        if (error)
          reject(error);
        resolve(body);
      });
    });
  }
}
