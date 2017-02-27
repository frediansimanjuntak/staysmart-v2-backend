import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import propertiesSchema from '../model/properties-model';
import Amenities from '../../amenities/dao/amenities-dao'
import Attachments from '../../attachments/dao/attachments-dao'
import Users from '../../users/dao/users-dao'
import Companies from '../../companies/dao/companies-dao'
import Developments from '../../developments/dao/developments-dao'

propertiesSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Properties
          .find(_query)
          .populate("amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company")
          .exec((err, properties) => {
              err ? reject(err)
                  : resolve(properties);
          });
    });
});

propertiesSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Properties
          .findById(id)
          .populate("amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company")
          .exec((err, properties) => {
              err ? reject(err)
                  : resolve(properties);
          });
    });
});

propertiesSchema.static('createProperties', (properties:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(properties)) {
        return reject(new TypeError('Property is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = properties;
      
      var _properties = new Properties(properties);
          _properties.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
      var propertyID = _properties._id;
      Developments
        .findByIdAndUpdate(body.development, {
          $push: {
            "properties": propertyID
          }
        })
        .exec((err, saved) => {
            err ? reject(err)
                : resolve(saved);
        });
    });
});

propertiesSchema.static('updateProperties', (id:string, properties:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(properties)) {
          return reject(new TypeError('Property is not a valid object.'));
        }

        Properties
        .findByIdAndUpdate(id, properties)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

propertiesSchema.static('updateDetails', (id:string, details:Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      if(!_.isObject(details)) {
        return reject(new TypeError('Detail is not a valid object'));
      }
      var objectID = mongoose.Types.ObjectId;
      let body:any = details;
      let detailsObj = {$set: {}};
      for(var param in details) {
        detailsObj.$set['details.'+param] = details[param];
      }
      Properties
        .findByIdAndUpdate(id, detailsObj)
        .exec((err,saved) => {
          err ? reject(err)
              : resolve(saved);
        });
  });
});

propertiesSchema.static('createPropertyPictures', (propertyID:string, living:Object, dining:Object, bed:Object, toilet:Object, kitchen:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isString(propertyID)) {
        return reject(new TypeError('Property ID is not a valid string.'));
      }
      if (!_.isObject(living)) {
        return reject(new TypeError('Living is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  

      Attachments.createAttachments(living).then(res => {
        var idLiving = res.idAtt;
        for(var i = 0; i < idLiving.length; i++){
          Properties
            .update({"_id": propertyID}, {
              $push: {
                "pictures.living": idLiving[i]
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        }
      });
      Attachments.createAttachments(dining).then(res => {
        var idDining = res.idAtt;
        for(var i = 0; i < idDining.length; i++){
          Properties
            .update({"_id": propertyID}, {
              $push: {
                "pictures.dining": idDining[i]
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        }
      });
      Attachments.createAttachments(bed).then(res => {
        var idBed = res.idAtt;
        for(var i = 0; i < idBed.length; i++){
          Properties
            .update({"_id": propertyID}, {
              $push: {
                "pictures.bed": idBed[i]
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        }
      });
      Attachments.createAttachments(toilet).then(res => {
        var idToilet = res.idAtt;
        for(var i = 0; i < idToilet.length; i++){
          Properties
            .update({"_id": propertyID}, {
              $push: {
                "pictures.toilet": idToilet[i]
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        }
      });
      Attachments.createAttachments(kitchen).then(res => {
        var idKitchen = res.idAtt;
        for(var i = 0; i < idKitchen.length; i++){
          Properties
            .update({"_id": propertyID}, {
              $push: {
                "pictures.kitchen": idKitchen[i]
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        }
      });
    });
});

propertiesSchema.static('deleteProperties', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Properties
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

propertiesSchema.static('updatePropertySchedules', (id:string, schedules:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        var schedule = [].concat(schedules);
        for(var i = 0; i < schedule.length; i++) {
          let data:any = schedule[i];
          Properties
            .findByIdAndUpdate(id, {
              $push: {
                "schedules": {
                  "day": data.day,
                  "start_date": data.start_date,
                  "time_from": data.time_from,
                  "time_to": data.time_to
                }
              }
            })
            .exec((err, updated) => {
                err ? reject(err)
                    : resolve(updated);
            });
        }
    });
});

propertiesSchema.static('deletePropertyPictures', (id:string, type:string, pictureID:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        var field = "pictures."+type;
        let picObj = {$pull: {}};
        picObj.$pull[field] = pictureID;        
        Properties
          .findByIdAndUpdate(id, picObj)
          .exec((err, saved) => {
            err ? reject(err)
            : resolve(saved);
          });
        Attachments
          .findByIdAndRemove(pictureID)
          .exec((err, deleted) => {
            err ? reject(err)
            : resolve(deleted);
          });
    });
});

propertiesSchema.static('deletePropertySchedules', (id:string, idSchedule:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Properties
          .findByIdAndUpdate(id, {
            $pull: {
              "schedules": { 
                  "_id": idSchedule
              }
            }
          })
          .exec((err, saved) => {
            err ? reject(err)
            : resolve(saved);
          });
    });
});



let Properties = mongoose.model('Properties', propertiesSchema);

export default Properties;