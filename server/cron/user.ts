import * as express from "express";
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Users from '../api/v2/users/dao/users-dao';

var CronJob = require('cron').CronJob;

export class UserCron {
  static autoDeleteBlacklistToken():void{
    return new Promise((resolve:Function, reject:Function) => {
      new CronJob('00 08 1-31 * * *', function() {
        /* runs once at the specified date. */
        let today = new Date();
        Users
          .find({})
          .where("blacklisted_token.date").lt(today)
          .exec((err, users) => {
              let userData = users;
              for (var i = 0; i < userData.lenght; i++) {
                let user = userData[i];
                let idUser = userData[i]._id;
                for (var j = 0; j < user.blacklisted_token.length; j++) {
                    let idBlackList = user.blacklisted_token[j]._id;
                    Users
                        .update({"_id": idUser}, {
                            $pull: {
                                "blacklisted_token": {"_id": idBlackList}
                            }
                        })
                        .exec((err, updated) => {
                            err ? reject(err)
                                : resolve(updated);
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
}
