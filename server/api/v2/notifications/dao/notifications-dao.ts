import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import notificationsSchema from '../model/notifications-model';
import {socketIo} from '../../../../server';
import {notificationHelper} from '../../../../helper/notification.helper';

notificationsSchema.static('countAll', (userId: Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      Notifications.find({"user": userId}).exec((err, res) => {
        err ? reject({message: err.message})
            : resolve({
              message: 'All Notif',
              count: res.length,
              code: 200
            });
      })
    });
});

notificationsSchema.static('countUnread', (userId: Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      Notifications.find({"user": userId, "read": false}).exec((err, res) => {
        err ? reject({message: err.message})
            : resolve({
              message: 'Notread',
              count: res.length,
              code: 200
            });
      })
    });
});

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
              reject({message: err.message});
            }
            if(notifications){
              Notifications
                .find({"user": userId, "read": false})
                .exec((err, res) => {
                  if(err){
                    reject({message: err.message});
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
      Notifications.find({"user": id, "read": false}).exec((err, res) => {
        err ? reject({message: err.message})
            : resolve({
              message: 'success',
              code: 200,
              data: res.length 
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

notificationsSchema.static('listNotifications', (userId: string, limit: string, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Notifications.getByUser(userId, device).then(res => {
          let lim = Number(limit);
          resolve(res.slice(0, lim));
        });
    });
});

notificationsSchema.static('getByUser', (userId:string, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Notifications
          .find({"user": userId})
          .populate({
            path: 'user',
            model: 'Users',
            populate: {
              path: 'picture',
              model: 'Attachments'
            }
          })
          .exec((err, notifications) => {
            if (err) { reject({message: err.message}); }
            else {
              if (device == 'desktop') { resolve(notifications); }
              else {
                notificationHelper.getNotif(notifications).then(res => {
                  resolve(res);
                })
              }
            } 
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
          socketIo.socket(saved, 'notif');
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

notificationsSchema.static('clickNotificationsMobile', (id:string, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      Notifications.clickNotifications(id, device).then(res => {
        resolve(res);
      })
    });
});

notificationsSchema.static('clickNotifications', (id:string, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Notifications
          .findByIdAndUpdate(id,{
            $set: {
              "clicked": true,
              "clicked_at": new Date()
            }
          })
          .exec((err, update) => {
            if (err) { reject({message: err.message}); }
            else {
              (device == 'desktop') ? resolve(update) : resolve({message: 'success', code: 200});
            }
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