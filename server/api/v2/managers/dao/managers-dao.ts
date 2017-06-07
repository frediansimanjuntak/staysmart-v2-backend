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
            .populate("owner manager")
            .populate({
                path: 'property',
                model: 'Properties',
                populate: [{
                  path: 'pictures.living',
                  model: 'Attachments'
                },{
                  path: 'pictures.dining',
                  model: 'Attachments'
                },{
                  path: 'pictures.bed',
                  model: 'Attachments'
                },{
                  path: 'pictures.toilet',
                  model: 'Attachments'
                },{
                  path: 'pictures.kitchen',
                  model: 'Attachments'
                },{
                  path: 'development',
                  model: 'Developments'
                }]
            })
            .exec((err, managers) => {
                err ? reject({message: err.message})
                    : resolve(managers);                     
            });
    });
});

managersSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Managers
            .findById(id)
            .populate("owner manager")
            .populate({
                path: 'property',
                model: 'Properties',
                populate: [{
                  path: 'pictures.living',
                  model: 'Attachments'
                },{
                  path: 'pictures.dining',
                  model: 'Attachments'
                },{
                  path: 'pictures.bed',
                  model: 'Attachments'
                },{
                  path: 'pictures.toilet',
                  model: 'Attachments'
                },{
                  path: 'pictures.kitchen',
                  model: 'Attachments'
                },{
                  path: 'development',
                  model: 'Developments'
                }]
            })
            .exec((err, managers) => {
                err ? reject({message: err.message})
                    : resolve(managers);
            });
    });
});

managersSchema.static('getOwnManager', (userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Managers
            .find({"manager": userId})
            .populate("owner manager")
            .populate({
                path: 'property',
                model: 'Properties',
                populate: [{
                  path: 'pictures.living',
                  model: 'Attachments'
                },{
                  path: 'pictures.dining',
                  model: 'Attachments'
                },{
                  path: 'pictures.bed',
                  model: 'Attachments'
                },{
                  path: 'pictures.toilet',
                  model: 'Attachments'
                },{
                  path: 'pictures.kitchen',
                  model: 'Attachments'
                },{
                  path: 'development',
                  model: 'Developments'
                }]
            })
            .exec((err, managers) => {
                if(err){
                    reject({message: err.message});
                }
                    if(managers){                
                    resolve(managers);
                }
            });         
    });
});

managersSchema.static('getManagerDetails', (type: string, device: string, userId: Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let types = ['owned','managed', 'appointed'];
        if (types.indexOf(type) == -1) {
            reject({message: 'wrong type.'});
        }
        else {
            if (type == 'owned') {
                Properties.getUserProperties(userId, device).then(res => {
                    resolve(res);
                });
            }
            else {
                let status;
                if (type == 'managed') {
                    status = "accepted";
                }
                else if (type == 'appointed') {
                    status = "pending";
                }
                Properties.getAll(device, userId).then(properties => {
                    let prop_data = properties;
                    Managers.find({"manager": userId, "status": status}).exec((err, manager) => {
                        if (err) { reject({message: err.message}); }
                        else {
                            if (manager.length > 0) {
                                let manager_prop = [];
                                for (var i = 0; i < prop_data.length; i++) {
                                    for (var j = 0; j < manager.length; j++) {
                                        if (prop_data[i]._id == manager[j].property) {
                                            manager_prop.push(prop_data[i]);
                                        }
                                    }
                                }
                                resolve(manager_prop);
                            }
                            else {
                                resolve([]);
                            }
                        }
                    })
                });
            }
        }
    });
});

managersSchema.static('createManagers', (userId:string, managers:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(managers)) {
            return reject(new TypeError('Notification is not a valid object.'));
        }

        let IDuser = userId.toString();
        let body:any = managers;
        let managerId = body.manager;
        let properties = [].concat(body.property);
        let status = "pending";
        console.log(managers);

        for (var i = 0; i < properties.length; i++){
            let propertyID = properties[i];
            Properties
                .findById(propertyID)
                .exec((err, result) => {
                    if(err){
                        reject({message: err.message});
                    }
                    if(result){
                        let owner = result.owner.user;
                        if(owner != IDuser){
                            reject({message: "forbidden"});
                        }
                        if(owner == IDuser){
                            if(!result.manager){
                                Managers
                                    .find({"property": propertyID, "manager": managerId})
                                    .exec((err, res) => {
                                        if(err){
                                            reject({message: err.message});
                                        }
                                        if(res){
                                            if(res.length > 0){
                                                reject({message: "waiting manager accept/reject this managed property"});
                                            }
                                            if(res.length == 0){
                                                var _managers = new Managers();
                                                _managers.property = propertyID;
                                                _managers.owner = owner;
                                                _managers.manager = managerId;
                                                _managers.chat = body.chat;
                                                _managers.status = "pending";
                                                _managers.save((err, res) => {
                                                    err ? reject({message: err.message})
                                                        : resolve(res);
                                                })
                                            }
                                        }
                                    })
                            }
                            if(result.manager){
                                reject({message: "Allready have manager on this property"})
                            }
                        }
                    }
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
        Managers
            .find({"_id": id, "manager": userId})
            .populate("property")
            .exec((err, res) => {
                if(err){
                    reject({message: err.message});
                }
                if(res){
                    if(res.length == 0){
                        resolve({message: "no data"})
                    }
                    if(res.length > 0){
                        _.each(res, (result) => {
                            if(result){
                                let propertyId = result.property._id;
                                if(result.property.manager){
                                    reject({message: "Already Manager"})
                                }
                                if(!result.property.manager){
                                    if(result.status == "pending"){
                                        result.status = status;
                                        result.save((err, saved) => {
                                            if(err){
                                                reject({message: err.message});
                                            }    
                                            if(saved){
                                                Users
                                                    .findByIdAndUpdate(userId, {
                                                        $push: {
                                                            "managed_properties": propertyId
                                                        }
                                                    })
                                                    .exec((err, update) => {
                                                        err ? reject({message: err.message})
                                                            : resolve(update);
                                                    });
                                                Properties
                                                    .findByIdAndUpdate(propertyId, {
                                                        $set: {
                                                            "manager": userId
                                                        }
                                                    })
                                                    .exec((err, updated) => {
                                                        if(err){
                                                            reject({message: err.message});
                                                        }
                                                        if(updated){
                                                            if(result.chat == true){
                                                                ChatRooms
                                                                    .find({"property_id": propertyId})
                                                                    .exec((err, chat_room) => {
                                                                        if(err) {
                                                                        reject({message: err.message});
                                                                        }
                                                                        else if(chat_room) {
                                                                            for(var i = 0; i < chat_room.length; i++){
                                                                                ChatRooms.postMembers(chat_room[i].room_id, userId); 
                                                                            }
                                                                        }
                                                                    })
                                                            }
                                                            Managers.notificationManager(id, status, userId);
                                                        }
                                                    })                                                
                                            }
                                        })
                                    }
                                    if(result.status == "rejected"){
                                        resolve({message: "Manager Has Rejected"});  
                                    }
                                    if(result.status == "accepted"){
                                        resolve({message: "Manager Has Accepted"});  
                                    }
                                }
                            }
                        })
                    }                    
                }
            })       
    });
});

managersSchema.static('rejectManagers', (id:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
        return reject(new TypeError('Id is not a valid string.'));
        }

        let status = "rejected";

         Managers
            .find({"_id": id, "manager": userId})
            .populate("property")
            .exec((err, res) => {
                if(err){
                    reject({message: err.message});
                }
                if(res){
                    if(res.length == 0){
                        resolve({message: "no data"})
                    }
                    if(res.length > 0){                        
                        _.each(res, (result) => {
                            if(result.status == "pending"){
                                result.status = status;
                                result.save((err, saved) => {
                                    if(err){
                                        reject({message: err.message});
                                    }
                                    if(saved){
                                        Managers.notificationManager(id, status, userId);
                                        resolve(reject);
                                    }
                                })
                            }
                            if(result.status == "accepted"){
                                resolve({message: "Already accepted this manager"})
                            }
                            if(result.status == "rejected"){
                                resolve({message: "Already rejected this manager"})
                            }
                        })
                    }
                }
            })
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
                    .update({"_id": id, "manager": userId}, {
                        $set: {
                            "status": status
                        }
                    })
                    .exec((err, update) => {
                        if(err) {
                            reject({message: err.message});
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
                            reject({message: err.message});
                        }
                        else if(update) {
                            Managers
                                .findOne({"_id": id, "manager": userId, "chat": true}, (err, managerData) => {
                                    if(err) {
                                        reject({message: err.message});
                                    }
                                    else{
                                        ChatRooms
                                            .find({"property_id":propertyId})
                                            .exec((err, chat_room) => {
                                                if(err) {
                                                reject({message: err.message});
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
                            err ? reject({message: err.message})
                                : resolve(update);
                        });
                }  
            Managers.notificationManager(id, status, userId);          
            })
    });
});

managersSchema.static('notificationManager', (id:string, status:string, managerId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        let message = "";
        let type_notif = "";
        let user = "";

        Managers
            .findOne({"_id": id, "manager": managerId})
            .exec((err, res) => {
                if(err){
                    reject({message: err.message});
                }
                if(res){
                    let id = res._id;
                    let propertyId = res.property;
                    let ownerId = res.owner;
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
                                err ? reject({message: err.message})
                                    : resolve(update);
                            });
                        }) 
                }
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
                err ? reject({message: err.message})
                    : resolve();
            });
    });
});

managersSchema.static('deleteUserManagers', (idproperty:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(idproperty)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Properties
            .findById(idproperty)
            .populate("manager")
            .exec((err, res) => {
                if(err){
                    reject({message: err.message});
                }
                if(res){
                    if(res.manager._id){
                        let idUserManager = res.manager._id;
                        Managers
                            .remove({"manager": idUserManager})
                            .exec((err, removed) => {
                                err ? reject({message: err.message})
                                    : resolve(removed);
                            })
                        Users
                            .findByIdAndUpdate(idUserManager, {
                                $push: {
                                    "managed_properties": idproperty
                                }
                            })
                            .exec((err, update) => {
                                err ? reject({message: err.message})
                                    : resolve(update);
                            });

                        Properties
                            .update({"_id": idproperty}, {
                                $unset: {
                                    "manager": idUserManager
                                }
                            })
                            .exec((err, update) => {
                                err ? reject({message: err.message})
                                    : resolve(update);
                            });
                    }
                    else{
                        reject({message: "no data"})
                    }
                }
            })
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
                err ? reject({message: err.message})
                    : resolve(updated);
            });
    });
});

let Managers = mongoose.model('Managers', managersSchema);

export default Managers;