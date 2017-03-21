import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Agreements from '../api/v2/agreements/dao/agreements-dao';

var CronJob = require('cron').CronJob;
var DateOnly = require('mongoose-dateonly')(mongoose);
var DateDiff = require('date-diff');

export class AutoReject {
  static autoRejectLetterOfIntent():void{
    new CronJob('* * * * * *', function() {
      /* runs once at the specified date. */
      let today = new Date();
      Agreements
        .find({})
        .exec((err, result) => {
          for(var i = 0; i < result.length; i++){
            var loi_created_at = result[i].letter_of_intent.created_at;
            var loi_diff = new DateDiff(today, loi_created_at);
            if(loi_diff >= 7){
              Agreements
                .findByIdAndUpdate(result[i]._id, {
                  $set: {
                    "letter_of_intent.status": "expired"
                  }
                })
                .exec((err, update) => {
                  if(update) {
                    Agreements.notification(result[i]._id, 'rejectLOI');
                  }
                });
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
  }

  static autoRejectTenancyAgreement():void{
    new CronJob('* * * * * *', function() {
      /* runs once at the specified date. */
      let today = new Date();
      Agreements
        .find({})
        .exec((err, result) => {
          if(result.length > 0) {
            for(var i = 0; i < result.length; i++){
              if(result[i].tenancy_agreement.created_at){
                var ta_created_at = result[i].tenancy_agreement.created_at;
                var ta_diff = new DateDiff(today, ta_created_at);
                if(ta_diff >= 7){
                  Agreements
                    .findByIdAndUpdate(result[i]._id, {
                      $set: {
                        "tenancy_agreement.status": "expired"
                      }
                    })
                    .exec((err, update) => {
                      if(update) {
                        Agreements.notification(result[i]._id, 'rejectTA');
                      }
                    });
                }  
              }
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
  }
}
