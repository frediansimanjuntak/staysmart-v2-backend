import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import notificationsSchema from '../model/notifications-model';

notificationsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Notifications
          .find(_query)
          .exec((err, notifications) => {
              err ? reject(err)
                  : resolve(notifications);
          });
    });
});

notificationsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Notifications
          .findById(id)
          .exec((err, notifications) => {
              err ? reject(err)
                  : resolve(notifications);
          });
    });
});

notificationsSchema.static('createNotifications', (notifications:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(notifications)) {
        return reject(new TypeError('Notification is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = notifications;
      
      var _notifications = new Notifications(notifications);
          _notifications.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
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
              err ? reject(err)
                  : resolve();
          });
        
    });
});

notificationsSchema.static('updateNotifications', (id:string, notifications:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(notifications)) {
          return reject(new TypeError('Notification is not a valid object.'));
        }

        Notifications
        .findByIdAndUpdate(id, notifications)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Notifications = mongoose.model('Notifications', notificationsSchema);

export default Notifications;