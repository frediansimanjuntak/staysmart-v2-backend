import * as express from "express";
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Agreements from '../api/v2/agreements/dao/agreements-dao';
import Properties from '../api/v2/properties/dao/properties-dao';

var CronJob = require('cron').CronJob;
var DateDiff = require('date-diff');

export class AutoReject {
  static autoRejectLetterOfIntent():void{
    return new Promise((resolve:Function, reject:Function) => {
      new CronJob('*/3 * * * *', function() {
        /* runs once at the specified date. */
        let oneWeeksAgo = new Date(+new Date() - 7*24*60*60*1000);
        Agreements
          .find({})
          .where("letter_of_intent.data.status").in(['pending', 'draft', 'payment-confirmed'])
          // .where("letter_of_intent.data.created_at").lte(oneWeeksAgo)
          .exec((err, agreement) => {
            if (err) {reject(err);}
            else {
              let agreementData = agreement;
              for(var i = 0; i < agreementData.length; i++){
                let idAgreement = agreementData[i]._id;
                Agreements
                  .findByIdAndUpdate(idAgreement, {
                    $set: {"letter_of_intent.data.status": "expired"}
                  })
                  .exec((err, updated) => {
                    if (err) { reject(err); }
                    else {
                      let type = "expiredLoi";
                      Agreements.email(idAgreement, type);
                      resolve({message:"success"});
                      console.log("updated");
                    }
                  })
              }
            }              
          })
        }, function () {
          /* This function is executed when the job stops */
          console.log('success!');
        },
        true,
        'Asia/Jakarta'
      );
    });
  }

  static autoRejectTenancyAgreement():void{
    return new Promise((resolve:Function, reject:Function) => {
      new CronJob('*/3 * * * *', function() {
      // new CronJob('00 08 1-31 * * *', function() {
        /* runs once at the specified date. */
        let oneWeeksAgo = new Date(+new Date() - 7*24*60*60*1000);
        Agreements
          .find({})
          .where("tenancy_agreement.data.status").in(['pending', 'admin-confirmation'])
          // .where("tenancy_agreement.data.created_at").lte(oneWeeksAgo)
          .exec((err, agreement) => {
            if (err) {reject(err);}
            else {
              let agreementData = agreement;
              for(var i = 0; i < agreementData.length; i++){
                let idAgreement = agreementData[i]._id;
                Agreements
                  .findByIdAndUpdate(idAgreement, {
                    $set: {"tenancy_agreement.data.status": "expired"}
                  })
                  .exec((err, updated) => {
                    if (err) { reject(err); }
                    else {
                      let type = "expiredLoi";
                      Agreements.email(idAgreement, type);
                      resolve({message:"success"});
                      console.log("updated");
                    }
                  })
              }
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

  static autoRentedPropertyExpired():void{
    return new Promise((resolve:Function, reject:Function) => {
      new CronJob('00-10 08 1-31 * * *', function() {
        /* runs once at the specified date. */
        Agreements.expiredPropertyRented()
        .then((res) => {console.log(res);})
        .catch((err) => {console.log(err);})
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