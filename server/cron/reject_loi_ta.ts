import * as express from "express";
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Agreements from '../api/v2/agreements/dao/agreements-dao';
import Properties from '../api/v2/properties/dao/properties-dao';
import Payments from '../api/v2/payments/dao/payments-dao';

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
          .populate("letter_of_intent.data.payment")
          .exec((err, agreement) => {
            if (err) {reject(err);}
            else {
              let agreementData = agreement;
              for(var i = 0; i < agreementData.length; i++){
                let agreement = agreementData[i];
                let idAgreement = agreement._id;
                let idProperty = agreement.property;                
                Agreements
                  .findByIdAndUpdate(idAgreement, {
                    $set: {"letter_of_intent.data.status": "expired"}
                  })
                  .exec((err, updated) => {
                    if (err) { reject(err); }
                    else {
                      if (agreement.letter_of_intent.data.payment) {
                        let idPayment = agreement.letter_of_intent.data.payment._id;
                        if (agreement.letter_of_intent.data.payment.attachment.payment && agreement.letter_of_intent.data.payment.status == "pending" || agreement.letter_of_intent.data.payment.status == "rejected") {
                          Agreements.changeNeedRefundAfterRejectLOI(idPayment, "expired");
                        }
                      }
                      this.updatePropertyExpired(idProperty);
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
          .where("tenancy_agreement.data.status").in(['pending'])
          // .where("tenancy_agreement.data.created_at").lte(oneWeeksAgo)
          .populate("tenancy_agreement.data.payment")
          .exec((err, agreement) => {
            if (err) {reject(err);}
            else {
              let agreementData = agreement;
              for(var i = 0; i < agreementData.length; i++){
                let idAgreement = agreementData[i]._id;
                let idProperty = agreementData[i].property;
                Agreements
                  .findByIdAndUpdate(idAgreement, {
                    $set: {"tenancy_agreement.data.status": "expired"}
                  })
                  .exec((err, updated) => {
                    if (err) { reject(err); }
                    else {
                      if (agreement.tenancy_agreement.data.payment) {
                        let idPaymentTA = agreement.tenancy_agreement.data.payment._id;
                        let idPaymentLOI = agreement.letter_of_intent.data.payment._id;
                        if (agreement.tenancy_agreement.data.payment.status == "pending" || agreement.tenancy_agreement.data.payment.status == "rejected") {
                          Agreements.penaltyPayment(idPaymentTA, "ta expired");
                          Agreements.penaltyPayment(idPaymentLOI, "ta expired");
                        }
                      }
                      this.updatePropertyExpired(idProperty);
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

  static updatePropertyExpired(id):void{
    return new Promise((resolve:Function, reject:Function) => {
      Properties
        .update({"_id": id}, {
          $set: {
            "status": "published"
          }
        })
        .exec((err, updated) => {
          err ? reject(err)
              : resolve(updated);
        })
    });
  }
}