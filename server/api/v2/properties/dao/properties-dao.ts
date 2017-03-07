import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import propertiesSchema from '../model/properties-model';
import Amenities from '../../amenities/dao/amenities-dao'
import Attachments from '../../attachments/dao/attachments-dao'
import Users from '../../users/dao/users-dao'
import Companies from '../../companies/dao/companies-dao'
import Developments from '../../developments/dao/developments-dao'
import Notifications from '../../notifications/dao/notifications-dao'

propertiesSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Properties
          .find(_query)
          .populate("development amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company owner.shareholder.$.identification_proof.front owner.shareholder.$.identification_proof.back confirmation.proof confirmation.by")
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
          .populate("development amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company owner.shareholder.$.identification_proof.front owner.shareholder.$.identification_proof.back confirmation.proof confirmation.by")
          .exec((err, properties) => {
              err ? reject(err)
                  : resolve(properties);
          });
    });
});

propertiesSchema.static('createProperties', (property:Object, userId:string, files:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(property)) {
        return reject(new TypeError('Property not a valid object.'));
      }
      
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = property;

      var _properties = new Properties(property);
          _properties.owner.user = userId;
          _properties.confirmation.status = 'pending';
          _properties.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
      let propertyID:string = _properties._id;

      if(body.owned_type == 'company'){
        let attach:any = files;
        if(attach.document != null) {
          var companyData = {
            "name": body.company_name,
            "registration_number": body.company_registration_number
          };
          Users
            .findById(userId, (err, result) => {
              if(result.companies.length == 0){
                Companies.createCompanies(companyData, attach.document, userId).then(res => {
                  var companyId = res.companiesId;
                  Properties
                    .findByIdAndUpdate(propertyID, {
                      $set: {
                        "owner.company": companyId
                      }
                    })
                    .exec((err, update) => {
                        err ? reject(err)
                            : resolve(update);
                    });
                });
              }
            })  
        }
      }

      if(files != null) {
        Properties.createPropertyPictures(propertyID, files);
        Properties.updatePropertyShareholderImage(userId, propertyID, files);
      }

      Users
        .update({"_id":userId}, {
          $push: {
            "owned_properties": propertyID
          }
        })
        .exec((err, saved) => {
            err ? reject(err)
                : resolve(saved);
        });
    });
});

propertiesSchema.static('updateProperties', (id:string, properties:Object, files:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(properties)) {
          return reject(new TypeError('Property is not a valid object.'));
        }
        var type = 'update';
        Properties.createPropertyHistory(id, type);
        Properties
          .findByIdAndUpdate(id, properties)
          .exec((err, updated) => {
                err ? reject(err)
                    : resolve(updated);
            });

        if(files != null) {
          let attach:any = files;
          Properties.createPropertyPictures(id, files);
        }
    });
});

propertiesSchema.static('createPropertyPictures', (propertyID:string, files:Object):Promise<any> => {
    // propertyID and files not validated, if validate -> error
    return new Promise((resolve:Function, reject:Function) => {
      var ObjectID = mongoose.Types.ObjectId;  
      let attach:any = files;
      if(attach.living != null) {
        Attachments.createAttachments(attach.living).then(res => {
          var idLiving = res.idAtt;
          var errUpload = res.errAtt;
          if(errUpload > 0) {
            reject({message: 'Failed to upload image'});
          }
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
      }
      if(attach.dining != null) {
        Attachments.createAttachments(attach.dining).then(res => {
          var idDining = res.idAtt;
          var errUpload = res.errAtt;
          if(errUpload > 0) {
            reject({message: 'Failed to upload image'});
          }
          for(var i = 0; i < idDining.length; i++){
            Properties
              .update({"_id": propertyID}, {
                $push: {
                  "pictures.dining": idDining
                }
              })
              .exec((err, saved) => {
                err ? reject(err)
                : resolve(saved);
              }); 
          } 
        });  
      }
      if(attach.bed != null) {
        Attachments.createAttachments(attach.bed).then(res => {
          var idBed = res.idAtt;
          var errUpload = res.errAtt;
          if(errUpload > 0) {
            reject({message: 'Failed to upload image'});
          }
          for(var i = 0; i < idBed.length; i++){
            Properties
              .update({"_id": propertyID}, {
                $push: {
                  "pictures.bed": idBed
                }
              })
              .exec((err, saved) => {
                err ? reject(err)
                : resolve(saved);
              });  
          }
        });  
      }
      if(attach.toilet != null) {
        Attachments.createAttachments(attach.toilet).then(res => {
          var idToilet = res.idAtt;
          var errUpload = res.errAtt;
          if(errUpload > 0) {
            reject({message: 'Failed to upload image'});
          }
          for(var i = 0; i < idToilet.length; i++){
            Properties
              .update({"_id": propertyID}, {
                $push: {
                  "pictures.toilet": idToilet
                }
              })
              .exec((err, saved) => {
                err ? reject(err)
                : resolve(saved);
              });  
          }
        });
      }
      if(attach.kitchen != null) {
        Attachments.createAttachments(attach.kitchen).then(res => {
          var idKitchen = res.idAtt;
          var errUpload = res.errAtt;
          if(errUpload > 0) {
            reject({message: 'Failed to upload image'});
          }
          for(var i = 0; i < idKitchen.length; i++){
            Properties
              .update({"_id": propertyID}, {
                $push: {
                  "pictures.kitchen": idKitchen
                }
              })
              .exec((err, saved) => {
                err ? reject(err)
                : resolve(saved);
              });  
          }
        });
      }
      if(attach.proof != null) {
        Attachments.createAttachments(attach.proof).then(res => {
          var idProof = res.idAtt;
          var errUpload = res.errAtt;
          if(errUpload > 0) {
            reject({message: 'Failed to upload image'});
          }
          Properties
            .update({"_id": propertyID}, {
              $set: {
                "confirmation.proof": idProof
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

propertiesSchema.static('updatePropertyShareholderImage', (userId:string, propertyID:string, files:Object):Promise<any> => {
    // propertyID and files not validated, if validate -> error
    return new Promise((resolve:Function, reject:Function) => {
      var ObjectID = mongoose.Types.ObjectId;  
      let attach:any = files;
      if(attach.front != null) {
        Attachments.createAttachments(attach.front).then(res => {
          var idFront = res.idAtt;
          var errUpload = res.errAtt;
          if(errUpload > 0) {
            reject({message: 'Failed to upload image'});
          }
          for(var i = 0; i < idFront.length; i++){
            Properties
              .findById(propertyID, (err, result) => {
                for(var j = 0; j < result.owner.shareholder.length; j++){
                  let body:any = result.owner.shareholder[j];
                  if(i == j) {
                    if(i == 0) {
                      Users
                        .findById(userId, (err, result) => {
                          if(result.landlord.data == null){
                            var type = 'landlord';
                            Users.createHistory(userId, type);
                            Users
                              .findByIdAndUpdate(userId, {
                                $set: {
                                  "landlord.data.name":body.name,
                                  "landlord.data.identification_type":body.identification_type,
                                  "landlord.data.identification_number":body.identification_number,
                                  "landlord.data.identification_proof.front":idFront[i]
                                }
                              })
                              .exec((err, saved) => {
                                err ? reject(err)
                                : resolve(saved);
                              }); 
                          }
                        })
                    }
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
      if(attach.back != null) {
        Attachments.createAttachments(attach.back).then(res => {
          var idBack = res.idAtt;
          var errUpload = res.errAtt;
          if(errUpload > 0) {
            reject({message: 'Failed to upload image'});
          }
          for(var i = 0; i < idBack.length; i++){
            Properties
              .findById(propertyID, (err, result) => {
                for(var j = 0; j < result.owner.shareholder.length; j++){
                  let body:any = result.owner.shareholder[j];
                  if(i == j) {
                    if(i == 0) {
                      Users
                        .findById(userId, (err, result) => {
                          if(result.landlord.data == null){
                            var type = 'landlord';
                            Users.createHistory(userId, type);
                            Users
                              .findByIdAndUpdate(userId, {
                                $set: {
                                  "landlord.data.identification_proof.back":idBack[i]
                                }
                              })
                              .exec((err, saved) => {
                                err ? reject(err)
                                : resolve(saved);
                              }); 
                            Properties.deletePropertyShareholder(propertyID, body._id);
                          }
                        })
                    }
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

propertiesSchema.static('createPropertyHistory', (id:string, type:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Properties
          .findById(id, "development address details schedules amenities pictures owned_type owner publish confirmation status", (err, result) => {
            var historyObj = {$push: {}};
            historyObj.$push['histories'] = {"action": type, "date": Date.now, "data": result};
            Properties
              .findByIdAndUpdate(id, historyObj)
              .exec((err, saved) => {
                err ? reject(err)
                : resolve(saved);
              });
          })
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

propertiesSchema.static('approveProperty', (id:string, proof:Object, userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      if(!_.isString(id)) {
        return reject(new TypeError('Id is not a valid string.'));
      }
      if(proof != null) {
        Attachments.createAttachments(proof).then(res => {
          var idProof = res.idAtt;
          Properties
            .update({"_id": id}, {
              $set: {
                "confirmation.status": "approved",
                "confirmation.proof": idProof,
                "confirmation.by": userId,
                "confirmation.date": Date.now
              }
            })
            .exec((err, update) => {
              err ? reject(err)
              : resolve(update);
            });
          Properties
            .findById(id, (err, result) => {
              var devID = result.development;
              var unit = '#'+result.address.floor+'-'+result.address.unit;
              
              if(result.status != 'draft') {
                Developments
                  .update({"_id":result.development}, {
                    $push: {
                      "properties": id
                    },
                    $inc:{
                      "number_of_units": 1
                    }
                  })
                  .exec((err, saved) => {
                      err ? reject(err)
                          : resolve(saved);
                  });
              }

              Developments
                .findById(devID, (error, devResult) => {
                  var notification = {
                    "user": result.owner.user,
                    "message": "Property approved for "+unit+" "+devResult.name,
                    "type": "approved_property",
                    "ref_id": id
                  };

                  Notifications.createNotifications(notification);        
                })
                .exec((err, update) => {
                  err ? reject(err)
                  : resolve(update);
                });
            })

        });
      }
      
  });
});

propertiesSchema.static('rejectProperty', (id:string, userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      if(!_.isString(id)) {
        return reject(new TypeError('Id is not a valid string.'));
      }
      Properties
        .update({"_id": id}, {
          $set: {
            "confirmation.status": "rejected",
            "confirmation.by": userId,
            "confirmation.date": Date.now
          }
        })
        .exec((err, update) => {
          err ? reject(err)
          : resolve(update);
        });
      Properties
        .findById(id, (err, result) => {
          var devID = result.development;
          var unit = '#'+result.address.floor+'-'+result.address.unit;
          Developments
            .findById(devID, (error, devResult) => {
              var notification = {
                "user": result.owner.user,
                "message": "Property rejected for "+unit+" "+devResult.name,
                "type": "rejected_property",
                "ref_id": id
              };

              Notifications.createNotifications(notification);        
            })
            .exec((err, update) => {
              err ? reject(err)
              : resolve(update);
            });
        })
  });
});

let Properties = mongoose.model('Properties', propertiesSchema);

export default Properties;