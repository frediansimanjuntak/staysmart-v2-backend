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

propertiesSchema.static('createProperties', (property:Object, files:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(property)) {
        return reject(new TypeError('Property not a valid object.'));
      }
      
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = property;
      
      var _properties = new Properties(property);
          _properties.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
      let propertyID = _properties._id;

      if(files != null) {
        let attach:any = files;
        Properties.createPropertyPictures(propertyID, attach.living, attach.dining, attach.bed, attach.toilet, attach.kitchen);
        Properties.updatePropertyShareholderImage(propertyID, attach.front, attach.back);
      }
      
      Developments
        .update({"_id":body.development}, {
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

propertiesSchema.static('createPropertyPictures', (propertyID:Object, living:Object, dining:Object, bed:Object, toilet:Object, kitchen:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(propertyID)) {
        return reject(new TypeError('Property ID is not a valid string.'));
      }
      if (!_.isObject(living)) {
        return reject(new TypeError('Living is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      if(living != null) {
        Attachments.createAttachments(living).then(res => {
          var idLiving = res.idAtt;
          Properties
            .update({"_id": propertyID}, {
              $set: {
                "pictures.living": idLiving
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        });  
      }
      if(dining != null) {
        Attachments.createAttachments(dining).then(res => {
          var idDining = res.idAtt;
          Properties
            .update({"_id": propertyID}, {
              $set: {
                "pictures.dining": idDining
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        });  
      }
      if(bed != null) {
        Attachments.createAttachments(bed).then(res => {
          var idBed = res.idAtt;
          Properties
            .update({"_id": propertyID}, {
              $set: {
                "pictures.bed": idBed
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        });  
      }
      if(toilet != null) {
        Attachments.createAttachments(toilet).then(res => {
          var idToilet = res.idAtt;
          Properties
            .update({"_id": propertyID}, {
              $set: {
                "pictures.toilet": idToilet
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        });
      }
      if(kitchen != null) {
        Attachments.createAttachments(kitchen).then(res => {
          var idKitchen = res.idAtt;
          Properties
            .update({"_id": propertyID}, {
              $set: {
                "pictures.kitchen": idKitchen
              }
            })
            .exec((err, saved) => {
              err ? reject(err)
              : resolve(saved);
            });  
        });
      }
    });
});

propertiesSchema.static('updatePropertyShareholderImage', (propertyID:Object, front:Object, back:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(propertyID)) {
        return reject(new TypeError('Property ID is not a valid string.'));
      }
      if (!_.isObject(front)) {
        return reject(new TypeError('front is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      if(front != null) {
        Attachments.createAttachments(front).then(res => {
          var idFront = res.idAtt;
          for(var i = 0; i < idFront.length; i++){
            Properties
              .findById(propertyID, (err, result) => {
                for(var j = 0; j < result.owner.shareholder.length; j++){
                  let body:any = result.owner.shareholder[j];
                  if(i == j) {
                    Properties
                      .update({"_id":propertyID, "owner.shareholder": {
                          $elemMatch: {
                            "_id": body._id
                          }
                        }
                      }, {
                        $set: {
                          "owner.shareholder.$.identification_proof.front":idFront[i]
                        }
                      }
                    )
                    .exec((err, saved) => {
                      err ? reject(err)
                      : resolve(saved);
                    });  
                  }
                }
              })  
          }
        });  
      }
      if(back != null) {
        Attachments.createAttachments(back).then(res => {
          var idBack = res.idAtt;
          for(var i = 0; i < idBack.length; i++){
            Properties
              .findById(propertyID, (err, result) => {
                for(var j = 0; j < result.owner.shareholder.length; j++){
                  let body:any = result.owner.shareholder[j];
                  if(i == j) {
                    Properties
                      .update({"_id":propertyID, "owner.shareholder": {
                          $elemMatch: {
                            "_id": body._id
                          }
                        }
                      }, {
                        $set: {
                          "owner.shareholder.$.identification_proof.back":idBack[i]
                        }
                      }
                    )
                    .exec((err, saved) => {
                      err ? reject(err)
                      : resolve(saved);
                    });  
                  }
                }
              })  
          }
        });  
      }
    });
});

propertiesSchema.static('deleteProperties', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Properties
          .findById(id, (err, result) => {
            for(var i = 0; i < result.pictures.living.length; i++){
              Attachments
                .findByIdAndRemove(result.pictures.living[i])
                .exec((err, deleted) => {
                    err ? reject(err)
                        : resolve(deleted);
                });
            }
            for(var i = 0; i < result.pictures.dining.length; i++){
              Attachments
                .findByIdAndRemove(result.pictures.dining[i])
                .exec((err, deleted) => {
                    err ? reject(err)
                        : resolve(deleted);
                });
            }
            for(var i = 0; i < result.pictures.bed.length; i++){
              Attachments
                .findByIdAndRemove(result.pictures.bed[i])
                .exec((err, deleted) => {
                    err ? reject(err)
                        : resolve(deleted);
                });
            }
            for(var i = 0; i < result.pictures.toilet.length; i++){
              Attachments
                .findByIdAndRemove(result.pictures.toilet[i])
                .exec((err, deleted) => {
                    err ? reject(err)
                        : resolve(deleted);
                });
            }
            for(var i = 0; i < result.pictures.kitchen.length; i++){
              Attachments
                .findByIdAndRemove(result.pictures.kitchen[i])
                .exec((err, deleted) => {
                    err ? reject(err)
                        : resolve(deleted);
                });
            }
            for(var i = 0; i < result.owner.shareholder.length; i++){
              Attachments
                .findByIdAndRemove(result.owner.shareholder[i].identification_proof.front)
                .exec((err, deleted) => {
                    err ? reject(err)
                        : resolve(deleted);
                });
              Attachments
                .findByIdAndRemove(result.owner.shareholder[i].identification_proof.back)
                .exec((err, deleted) => {
                    err ? reject(err)
                        : resolve(deleted);
                });
            }
          })

        Properties
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve(deleted);
          });
        
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

propertiesSchema.static('deletePropertyShareholder', (id:string, idShareholder:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      if(!_.isString(id)) {
        return reject(new TypeError('Id is not a valid string.'));
      }
      Properties
        .update({"_id": id, "owner.shareholder": {$elemMatch: { "_id": idShareholder}}}, (err, result) => {
          Attachments
            .findByIdAndRemove(result.identification_proof.front)
            .exec((err, deleted) => {
              err ? reject(err)
              : resolve(deleted);
            });
          Attachments
            .findByIdAndRemove(result.identification_proof.back)
            .exec((err, deleted) => {
              err ? reject(err)
              : resolve(deleted);
            });
        })
      Properties
        .findById(id, {
          $pull: {
            "owner.shareholder": {
              $elemMatch: {
                "_id": idShareholder
              }
            }
          }
        })
        .exec((err, deleted) => {
          err ? reject(err)
          : resolve(deleted);
        });
  });
});

let Properties = mongoose.model('Properties', propertiesSchema);

export default Properties;