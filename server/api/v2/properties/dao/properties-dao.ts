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

propertiesSchema.static('userLandlordProperty', (userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      Users
        .findById(userId).exec().then(user => {
          reject(true);
        })
  });
});

propertiesSchema.static('searchProperties', (searchComponent:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};
        var property = Properties.find(_query);

        let search:any = searchComponent;
        if(search.development != 'all') {
          property.where('development', search.development);
        }
        if(search.latlng != 'all') 
        {
          if(search.radius != 'all') {
            var radius = search.radius;
          }
          else{
            radius = 1500;
          }
          var latlng = search.latlng.split(",");
          var lnglat = [];
          lnglat.push(Number(latlng[1]));
          lnglat.push(Number(latlng[0]));
          property.where({'address.coordinates': { $geoWithin: { $centerSphere: [ lnglat, radius/3963.2 ] } } });
        }
        if(search.pricemin != 'all') 
        {
          property.where('details.price').gte(search.pricemin);
        }
        if(search.pricemax != 'all') 
        {
          property.where('details.price').lte(search.pricemax);
        }
        if(search.bedroom != 'all') 
        {
          property.where('details.bedroom', search.bedroom);
        }
        if(search.bathroom != 'all') 
        {
          property.where('details.bathroom', search.bathroom);
        }
        if(search.available != 'all') 
        {
          property.where('details.available').gte(search.available);
        }
        if(search.sizemin != 'all') 
        {
          property.where('details.size_sqf').gte(search.sizemin);
        }
        if(search.sizemax != 'all') 
        {
          property.where('details.size_sqf').lte(search.sizemax);
        }
        if(search.location != 'all') 
        {
          property.where('address.street_name', search.location);
        }

        property.populate("development amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by")
        property.populate({
          path: 'owner.user',
          populate: {
            path: 'picture',
            model: 'Attachments'
          },
          select: 'email picture landlord.data.name tenant.data.name'
        })
        property.exec((err, properties) => {
          err ? reject(err)
              : resolve(properties);
        });
    });
});

propertiesSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Properties
          .findById(id)
          .populate("development amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by")
          .populate({
            path: 'owner.user',
            populate: {
              path: 'picture',
              model: 'Attachments'
            },
            select: 'email picture landlord.data.name tenant.data.name'
          })
          .exec((err, properties) => {
              err ? reject(err)
                  : resolve(properties);
          });
    });
});

propertiesSchema.static('createProperties', (property:Object, userId:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(property)) {
        return reject(new TypeError('Property not a valid object.'));
      }
      if (!_.isObject(userId)) {
        return reject(new TypeError('User id not a valid object.'));
      }
      
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = property;

      var _properties = new Properties(property);
          _properties.owner.user = userId;
          _properties.confirmation.status = 'pending';
          _properties.save((err, saved)=>{
            if(err) {
              reject(err);
            }
            else if(saved){
              let propertyID = _properties._id;
      
              if(body.owned_type == 'company'){
                if(body.companyData) {
                  Users
                    .findById(userId, (err, result) => {
                      if(result.companies.length == 0){
                        Companies.createCompanies(body.companyData, userId).then(res => {
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

                          if(body.shareholders != null) {
                            Properties
                              .findByIdAndUpdate(propertyID, {
                                $set: {
                                  "temp.shareholders": body.shareholders
                                }
                              })
                              .exec((err, update) => {
                                  err ? reject(err)
                                      : resolve(update);
                              });
                          }
                        });
                      }
                    })  
                }

                if(body.owner.company && body.shareholders != null) {
                  Properties
                    .findByIdAndUpdate(propertyID, {
                      $set: {
                        "temp.shareholders": body.shareholders
                      }
                    })
                    .exec((err, update) => {
                        err ? reject(err)
                            : resolve(update);
                    });
                }
              }
              else if(body.owned_type == 'individual'){
                if(body.landlordData) {
                  var type = 'landlord';
                  Users.updateUserData(userId, type, body.landlordData, userId);
                }
                if(body.ownersData != null) {
                  Properties
                    .findByIdAndUpdate(propertyID, {
                      $set: {
                        "temp.owners": body.ownersData
                      }
                    })
                    .exec((err, update) => {
                        err ? reject(err)
                            : resolve(update);
                    });
                }
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
            }
          });
    });
});

propertiesSchema.static('updateProperties', (id:string, properties:Object, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
          return reject(new TypeError('Id is not a valid string.'));
        }
        if (!_.isObject(properties)) {
          return reject(new TypeError('Property is not a valid object.'));
        }
        Properties.ownerProperty(id, userId).then(res => {
          if(res.message) {
            reject({message: res.message});
          }
          else if(res == true){
            var type = 'update';
            Properties.createPropertyHistory(id, type);
            Properties
              .findByIdAndUpdate(id, properties)
              .exec((err, update) => {
                    err ? reject(err)
                        : resolve(update);
                });
          }
        });
    });
});

propertiesSchema.static('createPropertyHistory', (id:string, action:string, type:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Properties
          .findById(id, "details schedules amenities pictures owned_type owner confirmation status", (err, result) => {
            var historyObj = {$push: {}};
            historyObj.$push['histories'] = {"action": action, "date": Date.now, "data": result};
            Properties
              .findByIdAndUpdate(id, historyObj)
              .exec((err, saved) => {
                err ? reject(err)
                : resolve(saved);
              });
            if(type == 'data') {
              Properties
                .findById(id, {
                  $unset: {
                    "details": "",
                    "schedules": "",
                    "amenities": "",
                    "pictures": "",
                  }
                })
                .exec((err, update) => {
                  err ? reject(err)
                  : resolve(update);
                });
            }
            else if(type == 'confirmation'){
              Properties
                .findById(id, {
                  $unset: {
                    "confirmation": ""
                  }
                })
                .exec((err, update) => {
                  err ? reject(err)
                  : resolve(update);
                }); 
            }
          })
    });
});

propertiesSchema.static('deleteProperties', (id:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Properties.ownerProperty(id, userId).then(res => {
          if(res.message) {
            reject({message: res.message});
          }
          else if(res == true){
            Properties.findById(id, (err, result) => {
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
            })
            Users
              .findByIdAndUpdate(userId, {
                $pull: {
                  "owned_properties": id
                }
              })
              .exec((err, deleted) => {
                  err ? reject(err)
                      : resolve(deleted);
              });

            Properties
              .findByIdAndRemove(id)
              .exec((err, deleted) => {
                  err ? reject(err)
                      : resolve(deleted);
              });
          }
        });
    });
});

propertiesSchema.static('confirmationProperty', (id:string, proof:Object, userId:string, confirmation:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      if(!_.isString(id)) {
        return reject(new TypeError('Id is not a valid string.'));
      }
      if(!_.isString(userId)) {
        return reject(new TypeError('UserId is not a valid string.'));
      }
      if(!_.isObject(proof)) {
        return reject(new TypeError('Proof is not a valid object.'));
      }
      if(!_.isString(confirmation)) {
        return reject(new TypeError('Confirmation type is not a valid string.'));
      }
      var action = 'update';
      var type = 'confirmation';
      Properties.createPropertyHistory(id, action, type);

      if(confirmation == 'approve') {
        var confirmation_result = 'approved';

        Properties
          .findById(id, (err, properties) => {
            var shareholders = properties.temp.shareholders;
            var owners = properties.temp.owners;
            var companyId = properties.owner.company;

            if(shareholders.length > 0) {
              Companies.addCompaniesShareholders(companyId, shareholders, userId);
              var type = 'shareholders';
              Properties.unsetTemp(id, type);
            }
            if(owners.length > 0) {
              Users.updateUserDataOwners(userId, owners);
              var type = 'owners';
              Properties.unsetTemp(id, type);
            }
          })
      }
      else if(confirmation == 'reject'){
        confirmation_result = 'rejected';
      }
      let body:any = proof;
      Properties
        .update({"_id": id}, {
          $set: {
            "confirmation.status": confirmation_result,
            "confirmation.proof": body.proofId,
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
          
          if(result.status != 'draft' && confirmation == 'approve') {
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
                "message": "Property "+confirmation_result+" for "+unit+" "+devResult.name,
                "type": confirmation_result+"_property",
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

propertiesSchema.static('shortlistProperty', (id:string, userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      if(!_.isString(id)) {
        return reject(new TypeError('Id is not a valid string.'));
      }
      Users
        .findByIdAndUpdate(id, {
          $push: {
            "shortlisted_property": id
          }
        })
        .exec((err, update) => {
          err ? reject(err)
              : resolve(update);
        });
  });
});

propertiesSchema.static('unShortlistProperty', (id:string, userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      if(!_.isString(id)) {
        return reject(new TypeError('Id is not a valid string.'));
      }
      Users
        .findByIdAndUpdate(id, {
          $pull: {
            "shortlisted_property": id
          }
        })
        .exec((err, update) => {
          err ? reject(err)
              : resolve(update);
        });
  });
});

propertiesSchema.static('ownerProperty', (propertyId:string, userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      Users.findById(userId, (err, user) => {
        if(user.role != 'admin') {
          Properties.findById(propertyId, (err, result) => {
            if(result.owner.user != userId) {
              resolve({message: "Forbidden"});
            }
            else{
              resolve(true);
            }
          })    
        }
      })
  });
});

propertiesSchema.static('unsetTemp', (propertyId:string, type:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      var unset = 'temp.'+type;
      var unsetObj = {$unset:{}};
      unsetObj.$unset[unset] = "";
      Properties
        .findByIdAndUpdate(propertyId, unsetObj)
        .exec((err, update) => {
          err ? reject(err)
              : resolve(update);
        });
  });
});



let Properties = mongoose.model('Properties', propertiesSchema);

export default Properties;