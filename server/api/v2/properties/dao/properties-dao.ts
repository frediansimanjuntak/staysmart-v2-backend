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
import {mail} from '../../../../email/mail';
import config from '../../../../config/environment/index';
var split = require('split-string');

propertiesSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Properties
          .find({})
          .populate("development pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by")
          .populate({
            path: 'owner.user',
            populate: [{
              path: 'picture',
              model: 'Attachments'                          
            },
            {
              path: 'landlord.data.identification_proof.front',
              model: 'Attachments' 
            },
            {
              path: 'landlord.data.identification_proof.back',
              model: 'Attachments' 
            },
            {
              path: 'companies',
              model: 'Companies',
              populate: [{
                  path: 'documents',
                  model: 'Attachments'
                },
                {
                  path: 'shareholders.identification_proof.front',
                  model: 'Attachments'
                },
                {
                  path: 'shareholders.identification_proof.front',
                  model: 'Attachments'
                }]
            }]
          })
          .populate({
            path: 'amenities',
            populate: {
              path: 'icon',
              model: 'Attachments'
            }
          })
          .exec((err, properties) => {
            err ? reject(err)
                : resolve(properties);
          });
    });
});

propertiesSchema.static('searchProperties', (searchComponent:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var today = new Date();
        let _query = {"confirmation.status": "approved", "details.available": {$lte: today}};
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
        if(search.bedroomCount != 'all') 
        {
          var bedroom = split(search.bedroomCount, {sep: ','});
          for(var i = 0; i < bedroom.length; i++){
            if(bedroom[i] == 5) {
                property.where('details.bedroom').or([{'details.bedroom': bedroom[i]}, {'details.bedroom': { $gte: bedroom[i]}}]); 
            }  
            else{
              property.where('details.bedroom').or([{'details.bedroom': bedroom[i]}]);  
            }
          }
        }
        if(search.bathroomCount != 'all') 
        {
          var bathroom = split(search.bathroomCount, {sep: ','});
          for(var i = 0; i < bathroom.length; i++){
            if(bathroom[i] == 5) {
                property.where('details.bathroom').or([{'details.bathroom': bathroom[i]}, {'details.bathroom': { $gte: bathroom[i]}}]);  
            }  
            else{
              property.where('details.bathroom').or([{'details.bathroom': bathroom[i]}]);  ;  
            }
          }
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
        property.populate("development pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by")
        property.populate({
          path: 'owner.user',
          populate: {
            path: 'picture',
            model: 'Attachments'
          },
          select: 'username email picture landlord.data.name tenant.data.name'
        })
        property.populate({
          path: 'amenities',
          populate: {
            path: 'icon',
            model: 'Attachments'
          }
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
          .populate("development pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by")
          .populate({
            path: 'owner.user',
            populate: [{
              path: 'picture',
              model: 'Attachments'                          
            },
            {
              path: 'landlord.data.identification_proof.front',
              model: 'Attachments' 
            },
            {
              path: 'landlord.data.identification_proof.back',
              model: 'Attachments' 
            }],
            select: 'username email picture landlord.data reported'
          })
          .populate({
              path: 'owner.company',
              model: 'Companies',
              populate: [{
                  path: 'documents',
                  model: 'Attachments'
                },
                {
                  path: 'shareholders.identification_proof.front',
                  model: 'Attachments'
                },
                {
                  path: 'shareholders.identification_proof.front',
                  model: 'Attachments'
                }]
            })
          .populate({
            path: 'amenities',
            populate: {
              path: 'icon',
              model: 'Attachments'
            }
          })
          .exec((err, properties) => {
            err ? reject(err)
                : resolve(properties);
          });
    });
});

propertiesSchema.static('getBySlug', (slug:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Properties
          .findOne({"slug": slug})
          .populate("development amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by")
          .populate({
            path: 'owner.user',
            populate: {
              path: 'picture',
              model: 'Attachments'
            },
            select: 'username email picture landlord.data.name tenant.data.name'
          })
          .exec((err, properties) => {
            err ? reject(err)
                : resolve(properties);
          });
    });
});

propertiesSchema.static('getDraft', (userId:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Properties
          .find({"owner.user": userId, "status": "draft"})
          .populate("development amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by temp.owner.identification_proof.front temp.owner.identification_proof.back temp.shareholders.identification_proof.front temp.shareholders.identification_proof.back ")
          .populate({
            path: 'owner.user',
            populate: {
              path: 'picture',
              model: 'Attachments'
            },
            select: 'username email picture landlord.data.name tenant.data.name'
          })
          .exec((err, result) => {
            err ? reject(err)
                : resolve(result);
          });
    });
});

propertiesSchema.static('createProperties', (propertiesObject:Object, userId:Object, userEmail:string, userFullname:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(propertiesObject)) {
        return reject(new TypeError('Property not a valid object.'));
      }
      if(!userId || userId == null) {
        reject({message: 'Please login first before continue.'});
      }
      else{
        var ObjectID = mongoose.Types.ObjectId;  
        let body:any = propertiesObject;
        Developments
          .findById(body.development)
          .exec((err, development) => {
            if(err) {
              reject(err);
            }
            else if(development) {
              let slug = Developments.slug(body.address.floor+'-'+body.address.unit+' '+development.name);
              Properties
                .find({"development": body.development, "address.floor": body.address.floor, "address.unit": body.address.unit})
                .exec((err, properties) => {
                  if(err) {
                    reject(err);
                  }
                  else if(properties) {
                    if(properties.length > 0) {
                      reject({message: 'property for this floor and unit in this development already exist.'});
                    }
                    else{
                      var _properties = new Properties(propertiesObject);
                          _properties.slug = slug;
                          _properties.owner.user = userId;
                          _properties.confirmation.status = 'pending';
                          _properties.save((err, saved)=>{
                            if(err) {
                              reject(err);
                            }
                            else if(saved){
                              let propertyID = saved._id;
                              Properties.insertData(propertiesObject, propertyID, userId).then(res => {
                                Users
                                  .update({"_id":userId}, {
                                    $push: {
                                      "owned_properties": propertyID
                                    }
                                  })
                                  .exec((err, saved) => {
                                      if(err) {
                                        reject(err);
                                      }
                                      else if(saved) {
                                        if(!body.address.full_address) {
                                          reject({message:'no full address'});
                                        }
                                        else{
                                          var full_address = body.address.full_address;
                                          var from = 'Staysmart';
                                          if(body.status && body.status != 'draft') {
                                            mail.submitProperty(userEmail, userFullname, full_address, from);
                                            resolve({message: 'property created'});    
                                          }
                                          else if(body.status && body.status == 'draft'){
                                            resolve({message: 'property draft created'});
                                          }
                                          else{
                                            mail.submitProperty(userEmail, userFullname, full_address, from);
                                            resolve({message: 'property created'});
                                          }
                                        }
                                      }
                                  });
                                });
                            }
                          });
                    }
                  }
                })
            }
          })
      }
    });
});

propertiesSchema.static('updateProperties', (id:string, properties:Object, userId:Object, userEmail:string, userFullname:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let body:any = properties;
        Properties.ownerProperty(id, userId).then(res => {
          if(res.message) {
            reject({message: res.message});
          }
          else if(res == true){
            Properties
              .findById(id)
              .exec((err, property_result) => {
                if(err) {
                  reject(err);
                }
                else{
                  let old_status = property_result.status;
                  var action = 'update';
                  var type = 'data';
                  Properties.createPropertyHistory(id, action, type).then(history => {
                    Properties
                      .findByIdAndUpdate(id, properties)
                      .exec((err, update) => {
                            if(err) {
                              reject(err);
                            }
                            else{
                              Properties.insertData(properties, id, userId).then(res => {
                                if(body.status && body.status != 'draft') {
                                  Properties
                                    .findById(id)
                                    .exec((err, property) => {
                                      var owned_type = property.owned_type;
                                      if(property.temp) {
                                        if(property.temp.owner || property.temp.shareholders.length > 0) {
                                          var shareholders = property.temp.shareholders;
                                          var owner = property.temp.owner;
                                          
                                          var companyId = property.owner.company;

                                          if(shareholders.length > 0) {
                                            if(owned_type == 'individual') {
                                              Users.updateUserDataOwners(userId, shareholders);
                                              var type = 'shareholders';
                                              Properties.unsetTemp(id, type);
                                            }
                                            else{
                                              Companies.addCompaniesShareholders(companyId, shareholders, userId);
                                              var type = 'shareholders';
                                              Properties.unsetTemp(id, type);
                                            }
                                              
                                          }
                                          if(owner.name) {
                                            Users.updateUserData(userId, 'landlord', owner, userId);
                                            var type = 'owner';
                                            Properties.unsetTemp(id, type);
                                          }
                                          var full_address = body.address.full_address;
                                          var from = 'Staysmart';
                                          if(body.status && body.status != 'draft') {
                                            mail.submitProperty(userEmail, userFullname, full_address, from);
                                            resolve({res, message: 'property created'});
                                          }
                                        }
                                        else{
                                          resolve({message: 'Properties updated.'});
                                        }
                                      }
                                    })
                                }
                                else{
                                  resolve({message: 'Properties updated.'});
                                }
                              });
                            }  
                    });
                  });
                }
              })
          }
        });
    });
});

propertiesSchema.static('createPropertyHistory', (id:string, action:string, type:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var ObjectID = mongoose.Types.ObjectId;
        Properties
          .findById(id, "-_id details schedules amenities pictures owned_type owner confirmation status", (err, result) => {
            Properties
              .findByIdAndUpdate(id, {
                $push: {
                  "histories": {
                    "action": action,
                    "date": new Date(),
                    "data": result  
                  }
                }
              })
              .exec((err, saved) => {
                if(err) {
                  reject(err);
                }
                else if(saved) {
                  if(type == 'data') {
                    Properties
                      .findByIdAndUpdate(id, {
                        $unset: {
                          "details": "",
                          "schedules": "",
                          "amenities": "",
                          "pictures": "",
                        }
                      })
                      .exec((err, update) => {
                        err ? reject(err)
                        : resolve({message: 'updated'});
                      });
                  }
                  else if(type == 'confirmation'){
                    Properties
                      .findByIdAndUpdate(id, {
                        $unset: {
                          "confirmation": ""
                        }
                      })
                      .exec((err, update) => {
                        err ? reject(err)
                        : resolve({message: 'updated'});
                      }); 
                  }
                }
              });
          })
    });
});

propertiesSchema.static('deleteProperties', (id:string, userId:Object):Promise<any> => {
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

propertiesSchema.static('confirmationProperty', (id:string, userId:string, confirmation:string, proof:Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      var action = 'update';
      var type = 'confirmation';
      Properties.createPropertyHistory(id, action, type).then(res => {
        Properties
          .findById(id)
          .populate("owner.user")  
          .exec((err, properties) => {
            if(err) {
              reject(err);
            }
            else{
              if(properties.status != 'draft') {
                var emailTo = properties.owner.user.email;
                var full_name = properties.owner.user.username;
                var full_address = properties.address.full_address;
                var url = config.url.approveProperty;
                var from = 'Staysmart';

                if(confirmation == 'approve') {
                  var confirmation_result = 'approved';
                  mail.approveProperty(emailTo, full_name, full_address, url, from);
                }
                else if(confirmation == 'reject'){
                  confirmation_result = 'rejected';
                  mail.rejectProperty(emailTo, full_name, full_address, from);
                }
                let body:any = proof;
                Properties
                  .update({"_id": id}, {
                    $set: {
                      "confirmation.status": confirmation_result,
                      "confirmation.proof": body.proofId,
                      "confirmation.by": userId,
                      "confirmation.date": new Date()
                    }
                  })
                  .exec((err, update) => {
                    if(err) {
                      reject(err);
                    }
                    else{
                      Properties
                        .findById(id, (err, result) => {
                          result.status = 'published';
                          result.save((err, update) => {
                            if(err) {
                              reject(err);
                            }
                          });
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
                              .exec((err, update) => {
                                  if(err) {
                                    reject(err);
                                  }
                                  else{
                                    Developments
                                      .findById(devID)
                                      .exec((err, data) => {
                                        if(err) {
                                          reject(err);
                                        }
                                        else{
                                          var notification = {
                                            "user": result.owner.user,
                                            "message": "Property "+confirmation_result+" for "+unit+" "+data.name,
                                            "type": confirmation_result+"_property",
                                            "ref_id": id
                                          };

                                          Notifications.createNotifications(notification);
                                        }
                                      });
                                    resolve({message: 'confirmation updated'});
                                  }
                              });
                          }
                          else{
                            resolve({message: 'property status is draft.'});
                          }
                        })
                    }
                  });
              }
              else{
                resolve({message: 'property status is draft.'});
              }
            }
          })
        
      });
  });
});

propertiesSchema.static('shortlistProperty', (id:string, userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      if(!_.isString(id)) {
        return reject(new TypeError('Id is not a valid string.'));
      }
      Users
        .find({"_id": userId, "shortlisted_properties": id})
        .select("shortlisted_property")
        .exec((err, res) => {
          if(err){
            reject(err);
          }
          if(res){
            if(res.length > 0){
              resolve({message: "Already shortlisted this property"})
            }
            if(res.length == 0){
              Users
                .findByIdAndUpdate(userId, {
                  $push: {
                    "shortlisted_properties": id
                  }
                })
                .exec((err, update) => {
                  err ? reject(err)
                      : resolve({message: "Success shortlisted this property"});
                });
            }          
          }
        })     
  });
});

propertiesSchema.static('unShortlistProperty', (id:string, userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      if(!_.isString(id)) {
        return reject(new TypeError('Id is not a valid string.'));
      }
      Users
        .find({"_id": userId, "shortlisted_properties": id})
        .select("shortlisted_property")
        .exec((err, res) => {
          if(err){
            reject(err);
          }
          if(res){
            if(res.length == 0){
              resolve({message: "Not in your shortlisted property"})
            }
            if(res.length > 0){
              Users
                .findByIdAndUpdate(userId, {
                  $pull: {
                    "shortlisted_properties": id
                  }
                })
                .exec((err, update) => {
                  err ? reject(err)
                      : resolve({message: "Success to unshortlisted this property"});
                });
            }          
          }
        })
  });
});

propertiesSchema.static('ownerProperty', (propertyId:string, userId:Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      Users
        .findById(userId)
        .exec((err, user) => {
          if(user.role != 'admin') {
            Properties.findById(propertyId, (err, result) => {
              let user_id = userId.toString();
              if(result.owner.user == user_id) {
                resolve(true);
              }
              else{
                resolve({message: "Forbidden"});
              }
            })    
          }
          else{
            resolve(true);
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

propertiesSchema.static('insertData', (data:Object, propertyId: Object, userId:Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
    let body:any = data;
    if(body.landlordData) {
      if(body.status == 'draft') {
        Properties
          .findByIdAndUpdate(propertyId, {
            $set: {
              "temp.owner": body.landlordData
            }
          })
          .exec((err, res) => {
            if(err) {
              reject(err);
            }
          });
      }
      else{
        var type = 'landlord';
        Users.updateUserData(userId, type, body.landlordData, userId).then(res => {
          console.log('success');
        });
      }
    }

    if(body.owned_type == 'company'){
      if(body.companyData) {
        Users
          .findById(userId, (err, result) => {                                    
            Companies.createCompanies(body.companyData, userId).then(res => {
              var companyId = res.companiesId;
              Properties
                .findByIdAndUpdate(propertyId, {
                  $set: {
                    "owner.company": companyId
                  }
                })
                .exec((err, update) => {
                    if(err) {
                      reject(err);
                    }
                });
                
              if(body.shareholders != null) {
                if(body.status == 'draft') {
                  if(body.shareholders.length > 0) {
                    var shareholder_data = body.shareholders;

                    Properties
                      .findByIdAndUpdate(propertyId, {
                        $set: {
                          "temp.shareholders": shareholder_data
                        }
                      })
                      .exec((err, update) => {
                          if(err) {
                            reject(err);
                          }
                      });
                  }
                }
                else{
                  var shareholder_data = body.shareholders;
                  Companies
                    .findByIdAndUpdate(companyId, {
                      $set: {
                        "shareholders": shareholder_data
                      }
                    })
                    .exec((err, update) => {
                        if(err) {
                          reject(err);
                        }
                    });
                }
              }
            });
          })  
      }
      else if(body.owner && body.owner.company && body.shareholders.length > 0) {
        if(body.status == 'draft') {
          Properties
            .findByIdAndUpdate(propertyId, {
              $set: {
                "temp.shareholders": body.shareholders
              }
            })
            .exec((err, update) => {
              if(err) {
                reject(err);
              }  
            });
        }
        else{
          Companies
            .findByIdAndUpdate(body.owner.company, {
              $set: {
                "shareholders": body.shareholders
              }
            })
            .exec((err, update) => {
                if(err) {
                  reject(err);
                }
            });
        }
      }
    }
    else if(body.owned_type == 'individual'){
      if(body.shareholders && body.shareholders.length > 0) {
        if(body.status == 'draft') {
          Properties
            .findByIdAndUpdate(propertyId, {
              $set: {
                "temp.shareholders": body.shareholders
              }
            })
            .exec((err, update) => {
                if(err) {
                  reject(err);
                }
            });
        }
        else{
          Users
            .findByIdAndUpdate(userId, {
              $set: {
                "landlord.data.owners": body.shareholders
              }
            })
            .exec((err, update) => {
                if(err) {
                  reject(err);
                }
            });
        }
      }
    }
    resolve({message: 'done'});
  });
});


let Properties = mongoose.model('Properties', propertiesSchema);

export default Properties;