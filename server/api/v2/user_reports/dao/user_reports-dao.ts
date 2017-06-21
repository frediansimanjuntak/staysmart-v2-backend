import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import userReportsSchema from '../model/user_reports-model';
import Users from '../../users/dao/users-dao';
import Properties from '../../properties/dao/properties-dao'
import {userHelper} from '../../../../helper/user.helper';

userReportsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};
        UserReports
          .find(_query)
          .populate("reporter reported")
          .exec((err, reports) => {
              err ? reject({message: err.message})
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
                total_report: { $sum: 1 }
              } 
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "reported_data"
                }
            },
            {
                $unwind: "$reported_data"
            },
            {
                $project: {"id_user":"$reported_data._id", "username":"$reported_data.username", "total_report":"$total_report", "reported":"$reported_data.reported", _id:0}
            }];
        UserReports
          .aggregate(pipeline, (err, res) => {
            if (err) {
              reject({message: err.message});
            }
            else {
                resolve (res);
                console.log(res);
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
              err ? reject({message: err.message})
                  : resolve(reports);
          });
    });
});

userReportsSchema.static('getByReported', (reported:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(reported)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        let ObjectID = mongoose.Types.ObjectId;
        let pipeline = [{
            $match: {reported: new ObjectID(reported)}
        },
        {
            $lookup:
            {
                from: "users",
                localField: "reported",
                foreignField: "_id",
                as: "reported"
            }
        },
        {
            $lookup:
            {
                from: "users",
                localField: "reporter",
                foreignField: "_id",
                as: "reporter"
            }
        },
        {
            $unwind: "$reported"
        },
        {
            $unwind: "$reporter"
        },
        {
            $project: {
                "reported": {
                    "id_user": "$reported._id",
                    "username": "$reported.username"
                },
                "reporter": {
                    "id_user": "$reporter._id",
                    "username": "$reporter.username"
                },
                "reason": "$reason",
                "created_at": "$created_at"
            }
        }];
        UserReports
            .aggregate(pipeline, (err, res) => {
                if (err) {
                    reject({message: err.message});
                }
                else {
                    resolve (res);
                }
            })
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
          err ? reject({message: err.message})
              : resolve(saved);
        });
    });
});

userReportsSchema.static('reportUserMobile', (reports:Object, userId:string, headers: Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let body: any = reports;
        var _reports = new UserReports();
        _reports.reported = body.user_id;
        _reports.reason = body.reason;
        _reports.reporter = userId;
        _reports.save((err, saved)=>{
          if (err) { reject({message: err.message}); }
          else {
            Users.getById(userId).then(result => {
                userHelper.meHelper(result, headers, '').then(user_data => {
                    resolve(user_data);
                })
            })
          }
        });
    });
});

userReportsSchema.static('reportUser', (reported:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(reported)) {
            return reject(new TypeError('Id is not a valid string.'));
        }            
        Users
            .findById(reported)
            .exec((err, user) => {
                if (err) {
                    reject({message: err.message});
                }
                else if (user) {
                    let report;
                    if (user.reported === false) {
                        report = true;
                    } 
                    else {
                        report = false;
                    }
                    user.reported = report;
                    user.save((err, saved) => {
                        if (err) { reject({message: err.message}); }
                        else {
                            let ownProperty = saved.owned_properties;
                            for (var i = 0; i < ownProperty.length; i++) {
                                let propertyId = ownProperty[i];
                                UserReports.updatePropertyStatus(propertyId);
                            }
                            resolve(saved);
                        }
                    })
                }
                else {
                    reject({message: "user not found"});
                }
            })
    });
});

userReportsSchema.static('updatePropertyStatus', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Properties
            .findById(id)
            .exec((err, property) => {
                if (err) { reject(err); }
                else if (property) {
                    let status;
                    if (property.status == "published") {
                        status = "unpublished";
                    }
                    else if (property.status == "unpublished") {
                        status = "published";
                    }
                    property.status = status;
                    property.save((err, saved) => {
                        err ? reject(err)
                            : resolve(saved);
                    })
                }
                else { resolve({message: "property not found"}); }
            })
    });
});

userReportsSchema.static('deleteUserReports', (reported:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
         Users
            .findById(reported)
            .exec((err, user) => {
                if (err) { reject({message: err.message}); }
                else if (user) {
                    let report  = false;
                    user.reported = report;
                    user.save((err, saved) => {
                        if (err) {reject({message: err.message});}
                        else { 
                             UserReports
                                .remove({"reported": reported}, false)
                                .exec((err, deleted) => {
                                    err ? reject({message: err.message})
                                        : resolve({message: "delete success"});
                                });
                        }
                    })
                }
                else { reject({message: "user not found"}); }
            })
    });
});

let UserReports = mongoose.model('UserReports', userReportsSchema);

export default UserReports;