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

propertiesSchema.static('createProperties', (properties:Object, front:Object, back:Object, living:Object, dining:Object, bed:Object, toilet:Object, kitchen:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(properties)) {
        return reject(new TypeError('Property is not a valid object.'));
      }
      if (!_.isObject(living)) {
        return reject(new TypeError('Living is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = properties;
      
      var _properties = new Properties(properties);
          _properties.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
      var propertyID =_properties._id;

      if(front!= null) {
        Attachments.createAttachments(front).then(res => {
          var front_proof = res.idAtt;

          if(back != null) {
            Attachments.createAttachments(back).then(res => {
              var back_proof = res.idAtt;

              //create shareholder
              
            });
          }
        });
      }
      
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

let Properties = mongoose.model('Properties', propertiesSchema);

export default Properties;