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
      new CronJob('00 08 1-31 * * *', function() {
        /* runs once at the specified date. */
        let oneWeeksAgo = new Date(+new Date() - 7*24*60*60*1000);
        Agreements
          .find({})
          .where("letter_of_intent.data.status").in(['pending', 'draft', 'payment-confirmed'])
          .where("letter_of_intent.data.created_at").lte(oneWeeksAgo)
          .exec((err, agreement) => {
              let agreementData = agreement;
              for(var i = 0; i < agreementData.length; i++){
                let idAgreement = agreementData[i]._id;
                let type = "expiredLoi";                
                agreementData[i].letter_of_intent.status = "expired";
                agreementData[i].save((err, saved) => {
                  if(err){
                    reject(err);
                  }
                  if(saved){
                    Agreements.email(idAgreement, type);
                    resolve({message:"success"})
                  }
                });
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
          .find({})
          .where("tenancy_agreement.data.status").in(['pending', 'admin-confirmation'])
          .where("tenancy_agreement.data.created_at").lte(oneWeeksAgo)
          .exec((err, agreement) => {
              let agreementData = agreement;
              for(var i = 0; i < agreementData.length; i++){
                let idAgreement = agreementData[i]._id;
                let type = "expiredTa";                
                agreementData[i].tenancy_agreement.status = "expired";
                agreementData[i].save((err, saved) => {
                  if(err){
                    reject(err);
                  }
                  if(saved){
                    Agreements.email(idAgreement, type);
                    resolve({message:"success"})
                  }
                });
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