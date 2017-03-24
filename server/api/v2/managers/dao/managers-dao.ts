import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import managersSchema from '../model/managers-model';
import Notifications from '../../notifications/dao/notifications-dao';
import Properties from '../../properties/dao/properties-dao';
import Developments from '../../developments/dao/developments-dao';
import ChatRooms from '../../chats/dao/chats-dao';
import Users from '../../users/dao/users-dao';

managersSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Managers
          .find(_query)
          .exec((err, managers) => {
              err ? reject(err)
                  : resolve(managers);
          });
    });
});

managersSchema.static('getManagers', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
      }

      Managers
        .findById(id)
        .exec((err, managers) => {
            err ? reject(err)
                : resolve(managers);
        });
    });
});

managersSchema.static('getOwnManager', (id:string, idmanager:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
      }

      Managers
        .find({"_id": id, "data.manager": idmanager})
        .exec((err, managers) => {
            err ? reject(err)
                : resolve(managers);
        });
    });
});

managersSchema.static('createManagers', (userId:string, managers:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(managers)) {
        return reject(new TypeError('Notification is not a valid object.'));
      }

      let body:any = managers;
      let managerId = body.manager;
      let properties = [].concat(body.property);

      for (var i = 0; i < properties.length; i++){
        let property = properties[i];
        Managers
          .findOne({"property": property}, (err, data)=>{
            if (data == null){
              var _managers = new Managers();
                  _managers.property = property;
                  _managers.save();
            }

            let propertyId = property;
            let status = "pending";

            Managers
              .find({"property": property, "data.manager": managerId}, (err, result)=>{
                if (result != null){
                  console.log("maaf sudah pernah input")
                }
                else{
                  Managers
                    .update({"property": propertyId}, {
                      $push: {
                        "data": {
                          "manager": managerId,
                          "chat": body.chat,
                          "owner": userId,
                          "status": status,
                        }
                      }
                    })
                    .exec((err, update) => {
                      if(err) {
                        reject(err);
                      }
                      else{
                        Managers.notificationManager(propertyId, status, managerId);      
                      }
                    });        
                }
              })  
           }) 
        }    
    });
});

managersSchema.static('acceptManagers', (id:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        let status = "accepted";
        Managers.changeStatusManagers(id, status, userId)

        Managers
          .update({"_id": id, "data.manager": {$not: userId}}, {
            $set: {
              "data.$.status": status
            }
          })
          .exec((err, update) => {
             err ? reject(err)
                : resolve(update);
          });        
    });
});

managersSchema.static('rejectManagers', (id:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        let status = "rejected";
        Managers.changeStatusManagers(id, status, userId)
    });
});

managersSchema.static('changeStatusManagers', (id:string, status:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Managers
          .findById(id, (err, data) => {
            let propertyId = data.property;

            Managers
              .update({"_id": id, "data.manager": userId}, {
                $set: {
                  "data.$.status": status
                }
              })
              .exec((err, update) => {
                if(err) {
                  reject(err);
                }
              });   

            if(status == "accepted"){
              Properties
                .findByIdAndUpdate(propertyId, {
                  $set: {
                    "manager": userId
                  }
                })
                .exec((err, update) => {
                  if(err) {
                    reject(err);
                  }
                  else if(update) {
                      Managers
                        .findOne({"_id": id, "data": {$elemMatch: {"manager": userId, "chat": true}}}, (err, managerData) => {
                          if(err) {
                            reject(err);
                          }
                          else{
                            ChatRooms
                              .find({"property_id":propertyId})
                              .exec((err, chat_room) => {
                                if(err) {
                                  reject(err);
                                }
                                else if(chat_room) {
                                  for(var i = 0; i < chat_room.length; i++){
                                    ChatRooms.postMembers(chat_room[i].room_id, userId); 
                                  }
                                }
                              })
                          }
                        })
                  }
                });

              Users
                .findByIdAndUpdate(userId, {
                  $push: {
                    "managed_properties": propertyId
                  }
                })
                .exec((err, update) => {
                  err ? reject(err)
                      : resolve(update);
                });
            }  
            Managers.notificationManager(id, status, userId);          
          })
          
    });
});

managersSchema.static('notificationManager', (propertyId:string, status:string, managerId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
    if (!_.isString(propertyId)) {
      return reject(new TypeError('Id is not a valid string.'));
    }

    let message = "";
    let type_notif = "";
    let user = "";

    Managers
      .find({"property": propertyId, "data.manager": managerId}, (err, managerData) => {
        let id = managerData._id;
        let DataManager:any = managerData.data;
        let managerId = DataManager.manager;
        let ownerId = DataManager.owner;

        Properties
          .findById(propertyId, (err, result) => {
            var devID = result.development;
            var unit = '#' + result.address.floor + '-' + result.address.unit;
            Developments
              .findById(devID, (error, devResult) => {
                if(status == "pending"){
                  message = "You have been selected as a manager in " + unit + " " + devResult.name;
                  type_notif = "received_LOI";
                  user = managerId;
                }
                if(status == "accepted"){
                  message = "you have received as a manager in " + unit + " " + devResult.name;
                  type_notif = "rejected_LOI";
                  user = managerId;
                }
                if(status == "rejected"){
                  message = "You have rejected as a manager in " + unit + " " + devResult.name;
                  type_notif = "accepted_LOI";
                  user = ownerId;
                }

                var notification = {
                  "user": user,
                  "message": message,
                  "type": type_notif,
                  "ref_id": id
                };

                Notifications.createNotifications(notification);        
              })
              .exec((err, update) => {
                err ? reject(err)
                    : resolve(update);
              });
      })    
    }) 
  });
});

managersSchema.static('deleteManagers', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Managers
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

managersSchema.static('updateManagers', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
          return reject(new TypeError('Notification id is not a valid string.'));
        }
        Managers
          .findByIdAndUpdate(id, {
            $set: {
              "read_at": Date.now,
              "clicked": true
            }
          })
          .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Managers = mongoose.model('Managers', managersSchema);

export default Managers;