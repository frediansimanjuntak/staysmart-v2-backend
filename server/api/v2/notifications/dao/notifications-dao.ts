import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import notificationsSchema from '../model/notifications-model';
import {socketIo} from '../../../../server';

notificationsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Notifications
          .find(_query)
          .populate("user")
          .exec((err, notifications) => {
            err ? reject({message: err.message})
                : resolve(notifications);
          });
    });
});

notificationsSchema.static('getAllLimit', (limit:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {"user": userId};
        let limitNum = parseInt(limit);
        Notifications
          .find(_query)
          .populate("user")
          .limit( limitNum )
          .sort({created_at: 'desc'})
          .exec((err, notifications) => {
            if(err){
              reject(err);
            }
            if(notifications){
              Notifications
                .find({"user": userId, "read": false})
                .exec((err, res) => {
                  if(err){
                    reject(err);
                  }
                  if(res){
                    let data = {
                      "code": 200,
                      "message": "success",
                      "total_unread": res.length,
                      "data": notifications
                    }
                    resolve(data);
                  }
                })
            }
          });
    });
});

notificationsSchema.static('getUnreadCount', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      Notifications.find({"user": id, read: false}).then((err, res) => {
        err ? reject({message: err.message})
            : resolve({
              message: 'success',
              code: 200,
              data: { count: res.length }
            });
      })
    });
});

notificationsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Notifications
          .findById(id)
          .populate("user")
          .exec((err, notifications) => {
            err ? reject({message: err.message})
                : resolve(notifications);
          });
    });
});

notificationsSchema.static('getByUser', (userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Notifications
          .find({"user": userId})
          .populate("user")
          .exec((err, notifications) => {
            err ? reject({message: err.message})
                : resolve(notifications);
          });
    });
});

notificationsSchema.static('createNotifications', (notifications:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(notifications)) {
        return reject(new TypeError('Notification is not a valid object.'));
      }      
      var _notifications = new Notifications(notifications);
      _notifications.save((err, saved)=>{
        if(err){
          reject({message: err.message})
        }
        if(saved){
          socketIo.notif(saved);
          resolve(saved);
        }            
      });
    });
});

notificationsSchema.static('deleteNotifications', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Notifications
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
            err ? reject({message: err.message})
                : resolve();
          });
        
    });
});

notificationsSchema.static('readNotif', (userId:string, data: Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      let body: any = data;
      Notifications.update({"_id": {$in: body.notif_id}}, {
        $set: {
          read: true,
          read_at: new Date()
        }
      })
      .exec((err, res) => {
        err ? reject ({message: err.message})
            : resolve ({
              message: 'Success Read',
              code: 200
            });
      });
    });
});

notificationsSchema.static('readNotifications', (userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Notifications
          .update({"user": userId, "read": false},{
            $set: {
              "read": true,
              "read_at": new Date()
            }
          }, {multi: true})
          .exec((err, update) => {
            err ? reject({message: err.message})
                : resolve(update);
          });
    });
});

notificationsSchema.static('clickNotifications', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Notifications
          .findByIdAndUpdate(id,{
            $set: {
              "clicked": true,
              "clicked_at": new Date()
            }
          })
          .exec((err, update) => {
            err ? reject({message: err.message})
                : resolve(update);
          });
    });
});

notificationsSchema.static('updateNotifications', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
          return reject(new TypeError('Notification id is not a valid string.'));
        }
        Notifications
          .findByIdAndUpdate(id, {
            $set: {
              "read_at": new Date(),
              "clicked": true
            }
          })
          .exec((err, update) => {
            err ? reject({message: err.message})
                : resolve(update);
          });
    });
});

let Notifications = mongoose.model('Notifications', notificationsSchema);

export default Notifications;