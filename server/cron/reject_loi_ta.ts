import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Agreements from '../api/v2/agreements/dao/agreements-dao';

var CronJob = require('cron').CronJob;
var DateDiff = require('date-diff');

export class AutoReject {
  static autoRejectLetterOfIntent():void{
    return new Promise((resolve:Function, reject:Function) => {
      new CronJob('00 08 1-31 * * *', function() {
        /* runs once at the specified date. */
        let oneWeeksAgo = new Date(+new Date() - 7*24*60*60*1000);
        Agreements
          .update({}, {
            $set: {"letter_of_intent.status": "expired"}
          })
          .where("letter_of_intent.status").in(['pending', 'landlord-confirmation', 'admin-confirmation'])
          .where("letter_of_intent.created_at").lte(oneWeeksAgo)
          .exec((err, res) => {
            if(err){
              console.log('error');
            } 
            else
            {
              console.log(res);
            }
          })
        }, function () {
          /* This function is executed when the job stops */
          console.log('success!')
        },
        true,
        'Asia/Jakarta'
      );
    });
  }

  static autoRejectTenancyAgreement():void{
    return new Promise((resolve:Function, reject:Function) => {
      new CronJob('00 08 1-31 * * *', function() {
        /* runs once at the specified date. */
        let oneWeeksAgo = new Date(+new Date() - 7*24*60*60*1000);
        Agreements
          .update({}, {
            $set: {"tenancy_agreement.status": "expired"}
          })
          .where("tenancy_agreement.status").in(['pending', 'tenant-confirmation', 'admin-confirmation'])
          .where("tenancy_agreement.created_at").lte(oneWeeksAgo)
          .exec((err, res) => {
            if(err){
              console.log('error');
            } 
            else
            {
              console.log(res);
            }
          })
        }, function () {
          /* This function is executed when the job stops */
          console.log('success!')
        },
        true,
        'Asia/Jakarta'
      );
    });
  }
}
