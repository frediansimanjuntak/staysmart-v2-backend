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

propertiesSchema.static('searchProperties', (searchComponent:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};
        var property = Properties.find(_query);

        let search:any = searchComponent;
        if(search.latlng != 'all') 
        {
          if(search.radius != 'all') {
            var radius = search.radius;
          }
          else{
            radius = 1500;
          }
          var latlng = search.latlng.split(",").map(function(val){
            return Number(val)
          });
          property.where({'address.coordinates': { $geoWithin: { $centerSphere: [ latlng, radius/3963.2 ] } } });
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

        property.populate("development amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company owner.shareholder.$.identification_proof.front owner.shareholder.$.identification_proof.back confirmation.proof confirmation.by")
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
          .populate("development amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company owner.shareholder.$.identification_proof.front owner.shareholder.$.identification_proof.back confirmation.proof confirmation.by")
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
            err ? reject(err)
                : resolve(saved);
          });
      let propertyID:string = _properties._id;
      
      if(body.owned_type == 'company'){
        if(body.companyData != null) {
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
                });
              }
            })  
        }
        if(body.owner.company != null) {
          if(body.shareholders != null) {
            Companies.addCompaniesShareholders(body.companyId, body.shareholders);
          }
        }
      }
      else if(body.owned_type == 'individual'){
        if(body.landlordData != null) {
          var type = 'landlord';
          Users.updateUserData(userId, type, body.landlordData);
        }
        if(body.ownersData != null) {
          Users.updateUserDataOwners(userId, body.ownersData);
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
    });
});

propertiesSchema.static('updateProperties', (id:string, properties:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
          return reject(new TypeError('Id is not a valid string.'));
        }
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
          })

        Properties
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve(deleted);
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
      if(confirmation == 'approve') {
        var confirmation_result = 'approved';
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

let Properties = mongoose.model('Properties', propertiesSchema);

export default Properties;