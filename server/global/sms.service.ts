'use strict';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as request from 'request';
import config from '../config/environment/index';
import * as https from "https";

export class SMS{
  static sendActivationCode(number, code){
    return new Promise((resolve:Function, reject:Function) => {
      var headers = {
        'Content-Type': 'application/json'
      }
      var options = {
        url: 'https://secure.hoiio.com/open/sms/send',
        headers: headers,
        method: 'POST',
        form: {
          app_id: config.sms.app_id ,
          access_token: config.sms.access_token,
          dest: number,
          sender_name: 'Staysmart',
          msg: 'Thank you for joining Staysmart! Your verification code is ' + code + '. Your code is valid for 5 minutes.'
        }
      };
      
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body);
          resolve({body});
        }
        else{
          resolve({body});
        }
      })
    });
  }
}

export default SMS;