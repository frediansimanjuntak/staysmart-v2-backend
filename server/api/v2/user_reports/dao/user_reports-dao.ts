import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import userReportsSchema from '../model/user_reports-model';
import Users from '../../users/dao/users-dao'

userReportsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        UserReports
          .find(_query)
          .populate("reporter reported")
          .exec((err, reports) => {
              err ? reject(err)
                  : resolve(reports);
          });
    });
});

userReportsSchema.static('getGroupCount', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let pipeline = [{
              $unwind: "$reported"
            },
            { 
              $group: { 
                _id: "$reported",
                total_vote: { $sum: 1 }
              } 
            }];      

        UserReports
          .aggregate(pipeline, (err, res)=>{
            if(err){
              reject(err);
            }
            else{
              UserReports
                .populate(res, {path: '$reported'})
                .exec((err, res) => {
                  err ? reject(err)
                      : resolve(res);
                })
            }
          })
    });
});

userReportsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        UserReports
          .findById(id)
          .populate("reporter reported")
          .exec((err, reports) => {
              err ? reject(err)
                  : resolve(reports);
          });
    });
});

userReportsSchema.static('getByReported', (reported:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(reported)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        UserReports
          .findOne({"reported": reported})
          .populate("reporter reported")
          .exec((err, reports) => {
              err ? reject(err)
                  : resolve(reports);
          });
    });
});

userReportsSchema.static('createUserReports', (reports:Object, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(reports)) {
          return reject(new TypeError('Notification is not a valid object.'));
        }      
        var _reports = new UserReports(reports);
        _reports.reporter = userId;
        _reports.save((err, saved)=>{
          err ? reject(err)
              : resolve(saved);
        });
    });
});

userReportsSchema.static('reportUser', (reported:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(reported)) {
            return reject(new TypeError('Id is not a valid string.'));
        }      
        Users
          .findByIdAndUpdate(reported, {
            $set: {
              "reported": true
            }
          })
          .exec((err, res) => {
            err ? reject(err)
                : resolve(res);
          })
    });
});

userReportsSchema.static('deleteUserReports', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        UserReports
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve({message: "delete success"});
          });        
    });
});

let UserReports = mongoose.model('UserReports', userReportsSchema);

export default UserReports;