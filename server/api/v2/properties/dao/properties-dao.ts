import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import propertiesSchema from '../model/properties-model';
import Amenities from '../../amenities/dao/amenities-dao';
import Attachments from '../../attachments/dao/attachments-dao';
import Users from '../../users/dao/users-dao';
import Agreements from '../../agreements/dao/agreements-dao'
import Appointments from '../../appointments/dao/appointments-dao'
import Companies from '../../companies/dao/companies-dao';
import Developments from '../../developments/dao/developments-dao';
import Notifications from '../../notifications/dao/notifications-dao';
import {mail} from '../../../../email/mail';
import config from '../../../../config/environment/index';
import {socketIo} from '../../../../server';
import {propertyHelper} from '../../../../helper/property.helper';
import {GlobalService} from '../../../../global/global.service';
import * as moment from 'moment';
var split = require('split-string');

propertiesSchema.static('getAll', (device: string, userId: Object, type: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      var today = new Date();
      let date = today.getDate() + 1;
      let month = today.getMonth();
      let year = today.getFullYear();
      let _query = {};
      if ( device != 'desktop' ) {
        if (type == 'browse') {
          _query = {"confirmation.status": "approved", "details.available": {$lt: new Date(year, month, date)}, "status": "published"};
        }
        else {
          _query = {};
        }
      }
        Properties
          .find(_query)
          .populate("pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by rented.data.by agreements.data")
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
            path: 'development',
            populate: {
              path: 'properties',
              model: 'Properties'
            }
          })
          .populate({
            path: 'amenities',
            populate: {
              path: 'icon',
              model: 'Attachments'
            }
          })
          .exec((err, properties) => {            
            if (err) {
              reject({message: err.message})
            }
            else {
              if ( device != 'desktop' ) {
                propertyHelper.getAll(properties, userId).then(result => {
                  resolve(result);  
                });
              }
              else {
                resolve(properties);
              }
            }
          });
    });
});

propertiesSchema.static('searchProperties', (searchComponent:Object, from:string, device: string, request:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var today = new Date();
        let date = today.getDate() + 1;
        let month = today.getMonth();
        let year = today.getFullYear();
        let _query = {"confirmation.status": "approved", "details.available": {$lt: new Date(year, month, date)}, "status": "published"};
        var property = Properties.find(_query);

        let search:any = searchComponent;
        if(search.pricemin && search.pricemin != 'all') 
        {
          property.where('details.price').gte(search.pricemin);
        }
        if(search.pricemax && search.pricemax != 'all') 
        {
          property.where('details.price').lte(search.pricemax);
        }
        if(search.bedroom && search.bedroom != 'all') 
        {
          var bedroom = split(search.bedroom, {sep: ','});
          if(bedroom.length == 1) {
            property.where('details.bedroom', bedroom[0]);
          }
          else {
            for(var i = 0; i < bedroom.length; i++){
              if(bedroom[i] == 5) {
                  property.where('details.bedroom').or([{'details.bedroom': bedroom[i]}, {'details.bedroom': { $gte: bedroom[i]}}]); 
              }  
              else{
                property.where('details.bedroom').or([{'details.bedroom': bedroom[i]}]);  
              }
            }
          }
        }
        if(search.bathroom && search.bathroom != 'all') 
        {
          var bathroom = split(search.bathroom, {sep: ','});
          if(bathroom.length == 1) {
            property.where('details.bathroom', bathroom[0]);
          }
          else {
            for(var i = 0; i < bathroom.length; i++){
              if(bathroom[i] == 5) {
                  property.where('details.bathroom').or([{'details.bathroom': bathroom[i]}, {'details.bathroom': { $gte: bathroom[i]}}]);  
              }  
              else{
                property.where('details.bathroom').or([{'details.bathroom': bathroom[i]}]);
              }
            }
          }
        }
        if(search.available && search.available != 'all') 
        {
          property.where('details.available').lte(search.available);
        }
        if(search.sizemin && search.sizemin != 'all') 
        {
          property.where('details.size_sqf').gte(search.sizemin);
        }
        if(search.sizemax && search.sizemax != 'all') 
        {
          property.where('details.size_sqf').lte(search.sizemax);
        }
        
        property.populate("development pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by")
        property.populate({
          path: 'owner.user',
          populate: {
            path: 'picture',
            model: 'Attachments'
          },
          select: 'username email phone picture landlord.data.name tenant.data.name'
        })
        property.populate({
          path: 'amenities',
          populate: {
            path: 'icon',
            model: 'Attachments'
          }
        })
        property.exec((err, properties) => {
          if (err) {
            reject({message: err.message});
          }
          else {
            let prop_data = [];
            if (search.limit) {
              prop_data = properties.slice(0, search.limit);
            }
            else {
              prop_data = properties;
            }
            if( search.latlng != 'all' )
            {
              let radius;
              if(search.radius && search.radius != 'all') {
                radius = (search.radius) * 0.000621371192;
              }
              else{
                radius = 1.5 * 0.621371192;
              }
              let radiusQuery = radius / 3963.2;
              var latlng_dev = search.latlng.split(",");
              let developments = Developments.find({});
              let lat = Number(latlng_dev[0]);
              let lng = Number(latlng_dev[1]);
              if (from == 'mobile') {
                developments.where({address: { $geoWithin: { $centerSphere: [ [lat, lng], radiusQuery ] } } });
              }
              else {
                developments.where({address: { $geoWithin: { $centerSphere: [ [lng, lat], radiusQuery ] } } });
              }
              developments.exec((err, development) => {
                if (err) {
                  reject({message: err.message});
                }
                else {
                  let properties_data = [];
                  for(let i = 0; i < prop_data.length; i++) {
                    for(let j = 0; j < development.length; j++){
                      let prop_dev_id = prop_data[i].development._id.toString();
                      let dev_id = development[j]._id.toString();
                      if ( prop_data[i].development.slug == development[j].slug) {
                        properties_data.push(prop_data[i]);
                      }
                    }
                  }
                  let req: any = request;
                  if (req.user) {
                    propertyHelper.getAll(properties_data, req.user._id).then(result => {
                      resolve(result);  
                    });
                  }
                  else {
                    resolve(properties_data);
                  }
                }
              })
            }
            else {
              let req: any = request;
              if (req.user) {
                propertyHelper.getAll(prop_data, req.user._id).then(result => {
                  resolve(result);  
                });
              }
              else {
                resolve(prop_data);
              }
            }
          }
        });
    });
});

propertiesSchema.static('memberProperty', (type:string, userId:Object, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      let userType = [ 'tenant', 'landlord' ];
      if ( userType.indexOf(type) > -1 ) {
        Users.getById(userId)
          .then(result => {
            let properties = [];
            if (type == 'landlord') {
              Properties.getAll(device, userId, 'all').then(res => {
                let property = [];
                for (var i = 0; i < res.length; i++) {
                  if (res[i].user && String(res[i].user._id) == String(userId)) {
                    property.push(res[i]);
                  }
                }
                resolve(property);
              })
            }
            else {
              properties = result.rented_properties;
              let prop = [];
              for ( var i = 0; i < properties.length; i++ ) {
                properties[i].property != null ? prop.push(properties[i].property) : '';
              }
              if (prop.length > 0) {
                if ( device != 'desktop' ) {
                  propertyHelper.getAll(prop, userId).then(res => {
                    resolve(res);
                  });
                }
                else {
                  resolve(prop);
                }
              }
              else {
                resolve([]);
              }
            }
          })
      }
      else {
        reject({message: 'wrong user type.'});
      }
    });
});

propertiesSchema.static('updatePropertySeen', (id:string, user:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (user != "") {
        Properties
          .update({ "_id": id}, {
            $addToSet: {
              "seen.by":  user
            }
          })
          .exec((err, update) => {
            if (err) {
              reject({message: err.message});
            }
            else {
              resolve({
                message: 'success',
                code: 200,
                data: { update: 1 }
              });
            }
          });
      }
    });
});

propertiesSchema.static('getById', (id:string, user:string, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Properties.updatePropertySeen(id, user);

        Properties
          .findById(id)
          .populate("development pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by rented.data.by agreements.data")
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
            select: 'username email phone picture landlord.data reported'
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
                  path: 'shareholders.identification_proof.back',
                  model: 'Attachments'
                }]
            })          
          .populate({
            path: 'development',
            populate: {
              path: 'properties',
              model: 'Properties'
            }
          })
          .populate({
            path: 'amenities',
            populate: {
              path: 'icon',
              model: 'Attachments'
            }
          })
          .exec((err, properties) => {
            if (err) {
              reject({message: err.message})
            }
            else {
              if ( device != 'desktop' ) {
                propertyHelper.getById(properties, user).then(result => {
                  resolve(result);  
                });
              }
              else {
                resolve(properties);
              }
            }
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
            select: 'username email phone picture landlord.data.name tenant.data.name'
          })
          .exec((err, properties) => {
            err ? reject({message: err.message})
                : resolve(properties);
          });
    });
});

propertiesSchema.static('getUserProperties', (userId: Object, device: string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      let property = Properties.find({"owner.user": userId});
      property.populate("development pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.company confirmation.proof confirmation.by")
        property.populate({
          path: 'owner.user',
          populate: {
            path: 'picture',
            model: 'Attachments'
          },
          select: 'username email phone picture landlord.data.name tenant.data.name'
        })
        property.populate({
          path: 'amenities',
          populate: {
            path: 'icon',
            model: 'Attachments'
          }
        })
      property.exec((err, properties) => {
        if (err) {
          reject({message: err.message});
        }
        else {
          if ( device != 'desktop' ) {
            propertyHelper.getAll(properties, userId).then(result => {
              resolve(result);  
            });
          }
          else {
            resolve(properties);
          }
        }
      });
  });
});

propertiesSchema.static('getDraft', (userId:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      Properties
          .find({"owner.user": userId, "status": "draft"})
          .populate("development pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen confirmation.proof confirmation.by temp.owner.identification_proof.front temp.owner.identification_proof.back temp.shareholders.identification_proof.front temp.shareholders.identification_proof.back ")
          .populate({
            path: 'amenities',
            populate: {
              path: 'icon',
              model: 'Attachments'
            }
          })
          .populate({
            path: 'owner.user',
            populate: {
              path: 'picture',
              model: 'Attachments'
            },
            select: 'username email phone picture landlord.data.name tenant.data.name'
          })
          .populate({
            path: 'owner.company',
            populate: {
              path: 'documents',
              model: 'Attachments'
            },
            select: 'name registration_number documents shareholders'
          })
          .exec((err, result) => {
            err ? reject({message: err.message})
                : resolve(result);
          });
    });
});

propertiesSchema.static('getTotalListing', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Properties
			.find({"status": "pending", "confirmation.status": "pending"})
			.exec((err, properties) => {
				if (err) {
					reject({message: err.message});
				}
				else if (properties) {
					let data = { total: properties.length }
					socketIo.socket(data, 'counterCertificate');
					resolve(properties);
				}
			})
	});
});

propertiesSchema.static('memberFavourite', (userId: Object, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      Users.findById(userId).select("shortlisted_properties").exec((err, shortlisted) => {
        if (err) { reject({message: err.message}); }
        else {
          Properties.getAll(device, userId, 'browse').then(properties => {
            let favourite = [];
            for (var i = 0; i < shortlisted.shortlisted_properties.length; i++) {
              for (var j = 0; j < properties.length; j++) {
                if (String(shortlisted.shortlisted_properties[i]) == String(properties[j]._id)) {
                  favourite.push(properties[j]);
                }
              }
            }
            resolve(favourite);
          });
        }
      })
    });
});

propertiesSchema.static('createProperties', (propertiesObject:Object, userId:Object, userEmail:string, userFullname:string, userRole:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(propertiesObject)) {
        return reject(new TypeError('Property not a valid object.'));
      }
      else if(!userId || userId == null) {
        reject({message: 'Please login first before continue.'});
      }
      else{                     
        var ObjectID = mongoose.Types.ObjectId;  
        let body:any = GlobalService.validObjectEmpty(propertiesObject);
        console.log(body);   
        Developments
          .findById(body.development)
          .exec((err, development) => {
            if(err) {
              reject({message: err.message});
            }
            else if(development) {
              let slug = Developments.slug(body.address.floor+'-'+body.address.unit+' '+development.name);
              Properties
                .find({"development": body.development, "address.floor": body.address.floor, "address.unit": body.address.unit})
                .exec((err, properties) => {
                  if(err) {
                    reject({message: err.message});
                  }
                  else if(properties) {
                    if(properties.length > 0) {
                      reject({message: 'property for this floor and unit in this development already exist.'});
                    }
                    else{
                      var _properties = new Properties(body);
                          _properties.slug = slug;
                          _properties.confirmation.status = 'pending';
                          _properties.save((err, saved)=>{
                            if(err) {
                              reject({message: err.message});
                            }
                            else if(saved){
                              let propertyID = saved._id;
                              if (saved.owner.user) {
                                Properties.insertData(propertiesObject, propertyID, userId);
                                let owner = body.owner.user
                                Users
                                  .update({"_id": owner}, {
                                    $push: {
                                      "owned_properties": propertyID
                                    }
                                  })
                                  .exec((err, saved) => {
                                      err ? reject({message: err.message})
                                          : console.log(saved);
                                  })                            
                              }
                              if(!body.address.full_address) {
                                reject({message:'no full address'});
                              }
                              else{
                                var full_address = body.address.full_address;
                                var from = 'Staysmart';
                                if(body.status && body.status != 'draft') {
                                  Properties.getTotalListing()
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
                    }
                  }
                })
            }
          })       
      }
    });
});

propertiesSchema.static('createPropertiesWithoutOwner', (propertiesObject:Object, userId:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      let body:any = propertiesObject;
      Developments
        .findById(body.development)
        .exec((err, development) => {
          if(err) {
            reject({message: err.message});
          }
          else if(development) {
            let slug = Developments.slug(body.address.floor+'-'+body.address.unit+' '+development.name);
            Properties
              .find({"development": body.development, "address.floor": body.address.floor, "address.unit": body.address.unit})
              .exec((err, properties) => {
                if(err) {
                  reject({message: err.message});
                }
                else if(properties) {
                  if(properties.length > 0) {
                    reject({message: 'property for this floor and unit in this development already exist.'});
                  }
                  else{
                    var _properties = new Properties(body);
                    _properties.slug = slug;
                    _properties.status = 'draft';
                    _properties.confirmation.status = 'pending';
                    _properties.created_by = userId;
                    _properties.save((err, saved)=>{
                      if(err){
                        reject({message: err.message});
                      }
                      if(saved){
                        Developments
                          .update({"_id":saved.development}, {
                            $push: {
                              "properties": saved._id
                            },
                            $inc:{
                              "number_of_units": 1
                            }
                          })
                          .exec((err, update) => {
                            err ? reject({message: err.message})
                                : resolve(saved);
                          })
                      }                          
                    });
                  }
                }
              })
          }
        })
    });
});

propertiesSchema.static('updateProperties', (id:string, properties:Object, userId:Object, userEmail:string, userFullname:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let body:any = properties;
        let propertyObj = {$set: {}};
        for(var param in body) {
          propertyObj.$set[param] = body[param];
        }

        Properties.ownerProperty(id, userId).then(res => {
          if(res.message) {
            reject({message: res.message});
          }
          else if(res == true){
            if (body.owner) {
              Properties.addOwnedPropertyUser(id, body.owner.user);
            }
            else if (!body.owner) {
              Properties.deleteOwnedPropertyUser(id);
            }            
            Properties
              .findById(id)
              .exec((err, property_result) => {
                if(err) {
                  reject({message: err.message});
                }
                else{
                  let old_status = property_result.status;
                  var action = 'update';
                  var type = 'data';
                  Properties.createPropertyHistory(id, action, type).then(history => {
                    Properties
                      .findByIdAndUpdate(id, propertyObj)
                      .exec((err, update) => {
                            if(err) {
                              reject({message: err.message});
                            }
                            else{
                              Properties.insertData(properties, id, userId).then(res => {
                                if(body.status && body.status != 'draft') {
                                  Properties
                                    .findById(id)
                                    .exec((err, property) => {
                                      if(err){
                                        reject({message: err.message});
                                      }
                                      if(property){
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
                                                Users.updateUserDataOwners(userId, shareholders[0]);
                                                shareholders.splice(0, 1);
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
                                              Properties.getTotalListing();
                                              mail.submitProperty(userEmail, userFullname, full_address, from);
                                              resolve({res, message: 'property created'});
                                            }
                                          }
                                          else{
                                            resolve({message: 'Properties updated.'});
                                          }
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

propertiesSchema.static('addOwnedPropertyUser', (id:string, idUser:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var ObjectID = mongoose.Types.ObjectId;
        Properties
          .findById(id)
          .exec((err, property) => {
            if(err){
              reject({message: err.message});
            }
            else if(property){
              if(!property.owner.user){
                 Users
                  .update({"_id": idUser}, {
                    $push: {
                      "owned_properties": id
                    }
                  })
                  .exec((err, updated) => {
                    if(err){
                      reject({message: err.message});
                    }
                    else if(updated){
                      property.owner.user = idUser;
                      property.save((err, saved) => {
                        err ? reject({message: err.message})
                            : resolve(saved);
                      })
                    }                    
                  })
              } 
              else{
                resolve({message: "this property owner is already"});
              }            
            }
          })
    });
});

propertiesSchema.static('deleteOwnedPropertyUser', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var ObjectID = mongoose.Types.ObjectId;
        Properties
          .findById(id)
          .exec((err, property) => {
            if(err){
              reject({message: err.message});
            }
            else if(property){
              if (property.owner.user) {
                 Users
                  .update({"_id": property.owner.user}, {
                    $pull: {
                      "owned_properties": id
                    }
                  })
                  .exec((err, updated) => {
                    if(err){
                      console.log(err)
                      reject({message: err.message});
                    }
                    else if (updated) {
                      console.log(updated)
                      Properties
                        .update({"_id": id}, {
                          $unset: {
                            "owner.user": ""
                          }
                        })
                        .exec((err, saved) => {
                          err ? reject({message: err.message})
                              : resolve(saved);
                        })
                    }                    
                  })
              } 
              else{
                resolve({message: "owner this property not found"});
              }            
            }
          })
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
                  reject({message: err.message});
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
                        err ? reject({message: err.message})
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
                        err ? reject({message: err.message})
                            : resolve({message: 'updated'});
                      }); 
                  }
                }
              });
          })
    });
});

propertiesSchema.static('deleteProperties', (id:string, userId:Object, device: string):Promise<any> => {
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
                      err ? reject({message: err.message})
                          : '';
                  });
              }
              for(var i = 0; i < result.pictures.dining.length; i++){
                Attachments
                  .findByIdAndRemove(result.pictures.dining[i])
                  .exec((err, deleted) => {
                      err ? reject({message: err.message})
                          : '';
                  });
              }
              for(var i = 0; i < result.pictures.bed.length; i++){
                Attachments
                  .findByIdAndRemove(result.pictures.bed[i])
                  .exec((err, deleted) => {
                      err ? reject({message: err.message})
                          : '';
                  });
              }
              for(var i = 0; i < result.pictures.toilet.length; i++){
                Attachments
                  .findByIdAndRemove(result.pictures.toilet[i])
                  .exec((err, deleted) => {
                      err ? reject({message: err.message})
                          : '';
                  });
              }
              for(var i = 0; i < result.pictures.kitchen.length; i++){
                Attachments
                  .findByIdAndRemove(result.pictures.kitchen[i])
                  .exec((err, deleted) => {
                      err ? reject({message: err.message})
                          : '';
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
                  err ? reject({message: err.message})
                      : '';
              });

            Properties
              .findByIdAndRemove(id)
              .exec((err, deleted) => {
                  if (err) { reject({message: err.message}); }
                  else {
                    if (device == 'desktop') {
                      resolve(deleted);                      
                    }
                    else {
                      resolve({
                        message: 'success',
                        code: 200,
                        data: 1
                      });
                    }
                  }
              });
          }
        });
    });
});

propertiesSchema.static('confirmationProperty', (id:string, userId:string, confirmation:string, proof:Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      let body:any = proof;
      var action = 'update';
      var type = 'confirmation';
      Properties.createPropertyHistory(id, action, type).then((res) => {
        Properties
          .findById(id)
          .populate("owner.user")  
          .exec((err, property) => {
            if(err) {
              reject({message: err.message});
            }
            else if (property) {
              if(property.status != 'draft') {
                var emailTo = property.owner.user.email;
                var full_name = property.owner.user.username;
                var full_address = property.address.full_address;
                var url = config.url.approveProperty;
                var from = 'Staysmart';
                if(confirmation == 'approve' || confirmation == 'reject'){
                  let statusProperty;
                  if(confirmation == 'approve') {
                    var confirmation_result = 'approved';
                    statusProperty = "published";
                    mail.approveProperty(emailTo, full_name, full_address, url, from);
                  }
                  if(confirmation == 'reject'){
                    confirmation_result = 'rejected';
                    statusProperty = 'rejected';
                    mail.rejectProperty(emailTo, full_name, full_address, from);
                  }
                  property.confirmation.status = confirmation_result;
                  property.confirmation.proof = body.proofId;
                  property.confirmation.by = userId;
                  property.confirmation.date = new Date();
                  property.confirmation.remarks = body.remarks;
                  property.status = statusProperty;
                  property.save((err, saved) => {
                    if (err) { reject({message: err.message}); }
                    else {
                      var devID = saved.development;
                      var unit = '#'+saved.address.floor+'-'+saved.address.unit;
                      if(saved.status != 'draft' && confirmation == 'approve') {
                        Developments
                          .update({"_id": devID}, {
                            $push: {
                              "properties": id
                            },
                            $inc:{
                              "number_of_units": 1
                            }
                          })
                          .exec((err, update) => {
                              if(err) {
                                reject({message: err.message});
                              }
                              else{
                                Developments
                                  .findById(devID)
                                  .exec((err, data) => {
                                    if(err) {
                                      reject({message: err.message});
                                    }
                                    else{
                                      var notification = {
                                        "user": saved.owner.user,
                                        "message": "Listing "+confirmation_result+" for "+unit+" "+data.name,
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
                      else{ resolve({message: 'property status is draft.'}); }
                    }
                  })
                }
                else { reject({message: "wrong confirmation type"}); }
              }
              else { reject({message: "property status is draft"}); }
            }
          })
      });                 
  });
});

propertiesSchema.static('resubmitProperty', (id:string, userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      var action = 'update';
      var type = 'confirmation';
      var idUser = userId.toString();
      Properties.createPropertyHistory(id, action, type).then((res) => {
        Properties
          .findById(id)
          .populate("owner.user")  
          .exec((err, property) => {
            if(err) { reject({message: err.message}); }
            else if (property) {
              if (property.owner.user._id == idUser){
                if(property.status == 'rejected' && property.confirmation.status == 'rejected') {                
                  property.confirmation.status = "pending";
                  property.status = "pending";
                  property.save((err, saved) => {
                    err ? reject(err)
                        : resolve (saved);
                  })
                }
                else { reject({message: "Property status is not on rejected"}); }
              }
              else { reject({message: "forbidden"}); }
            }
          })
      });                 
  });
});

propertiesSchema.static('favourite', (id:string, userId:string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
    Users
        .find({"_id": userId, "shortlisted_properties": id})
        .select("shortlisted_property")
        .exec((err, res) => {
          if(err){
            reject({message: err.message});
          }
          if(res){
            if(res.length > 0){
              Users
                .findByIdAndUpdate(userId, {
                  $pull: {
                    "shortlisted_properties": id
                  }
                })
                .exec((err, update) => {
                  if (err) { reject({message: err.message}); }
                  else { 
                    Properties.getById(id, userId, 'phone').then(res => {
                      res["favourites"] = 'Not Shortlisted';
                      resolve(res);
                    })
                  }
                });
            }
            else {
              Users
                .findByIdAndUpdate(userId, {
                  $push: {
                    "shortlisted_properties": id
                  }
                })
                .exec((err, update) => {
                  if (err) { reject({message: err.message}); }
                  else { 
                    Properties.getById(id, userId, 'phone').then(res => {
                      res["favourites"] = 'Shortlisted';
                      resolve(res);
                    })
                  }
                });
            }          
          }
        }) 
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
            reject({message: err.message});
          }
          if(res){
            if(res.length > 0){
              resolve({message: "Already shortlisted this property"})
            }
            else {
              Users
                .findByIdAndUpdate(userId, {
                  $push: {
                    "shortlisted_properties": id
                  }
                })
                .exec((err, update) => {
                  err ? reject({message: err.message})
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
            reject({message: err.message});
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
                  err ? reject({message: err.message})
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
              else if(!result.owner.user){
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
          err ? reject({message: err.message})
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
              reject({message: err.message});
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
        if (body.companyData.documents && body.companyData.documents.length > 0) {
          Users
            .findById(userId, (err, result) => {     
              body.companyData.documents                               
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
                        reject({message: err.message});
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
                              reject({message: err.message});
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
                            reject({message: err.message});
                          }
                      });
                  }
                }
              });
            }) 
        }
        else {
          reject({message:'Please update min. 1 document.'});
        }
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
                reject({message: err.message});
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
                  reject({message: err.message});
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
                  reject({message: err.message});
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
                  reject({message: err.message});
                }
            });
        }
      }
    }
    resolve({message: 'done'});
  });
});

propertiesSchema.static('step1', (property: Object, userId: Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      Properties.find({"owner.user": userId, "status":"draft"}).exec((err, property_draft) => {
        if ( err ) {
          reject({message: err.message});
        }
        else {
          if ( property_draft.length > 0) {
            let draft = property_draft[0]; 
            if ( draft.owner.company ) {
              Companies.deleteCompanies(draft.owner.company, userId).then(res => {
                Properties.findByIdAndRemove(draft._id).exec();
              });
            }
            if (draft.pictures) {
              for (var i = 0; i < draft.pictures.living.length; i++) {
                Attachments.deleteAttachments(draft.pictures.living[i]);
              }
              for (var i = 0; i < draft.pictures.dining.length; i++) {
                Attachments.deleteAttachments(draft.pictures.dining[i]);
              }
              for (var i = 0; i < draft.pictures.bed.length; i++) {
                Attachments.deleteAttachments(draft.pictures.bed[i]);
              }
              for (var i = 0; i < draft.pictures.kitchen.length; i++) {
                Attachments.deleteAttachments(draft.pictures.kitchen[i]);
              }
              for (var i = 0; i < draft.pictures.toilet.length; i++) {
                Attachments.deleteAttachments(draft.pictures.toilet[i]);
              }
            }
            Properties.findByIdAndRemove(draft._id).exec();
          }
          let body: any = property;
          let _properties = new Properties();
              _properties.development = body.development;
              _properties.address.floor = body.address.unit_no;
              _properties.address.unit = body.address.unit_no_2;
              _properties.address.block_number = body.address.block_no;
              _properties.address.street_name = body.address.street_name;
              _properties.address.postal_code = body.address.postal_code;
              _properties.address.coordinates = body.address.coordinates;
              _properties.details.size_sqf = body.details.size;
              _properties.details.size_sqm = body.details.size_sqm;
              _properties.details.bedroom = body.details.bedroom;
              _properties.details.bathroom = body.details.bathroom;
              _properties.details.price = body.details.price;
              _properties.details.psqft = body.details.psqft;
              _properties.details.available = body.details.available;
              _properties.details.furnishing = body.details.furnishing;
              _properties.details.description = body.details.description;
              _properties.amenities = body.amenities;
              _properties.owner.user = userId;
              _properties.status = 'draft';
              _properties.save((err, save) => {
                err ? reject({message: err.message})
                    : resolve({message: 'Success'});
              });
        }
      })
  });
});

propertiesSchema.static('step2', (property: Object, userId: Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      Properties
        .find({"owner.user": userId, "status": "draft"})
        .exec((err, result) => {
          if (err) {
            reject({message: err.message});
          }
          else {
            if (result.length == 0) {
              reject({message: 'Fill step 1 first.'});
            }
            else {
              Properties
                .findByIdAndUpdate(result[0]._id, {
                  $set: {
                    'pictures': property
                  }
                })
                .exec((err, udpate) => {
                  err ? reject({message: err.message})
                      : resolve({message: 'Success'});
                });
            }
          }
        })
  });
});

propertiesSchema.static('step3', (property: Object, userId: Object, files: Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      Properties
        .find({"owner.user": userId, "status": "draft"})
        .exec((err, result) => {
          if (err) {
            reject({message: err.message});
          }
          else {
            if (result.length == 0) {
              reject({message: 'Fill step 1 first.'});
            }
            else {
              let image: any = files;
              let data: any = property;
              if (image.front) {
                Attachments.createAttachments(image.front, {}, 'phone').then(res => {
                  let file_front = res.imgId;
                  if (image.back) {
                    Attachments.createAttachments(image.back, {}, 'phone').then(res => {
                      let file_back = res.imgId;
                      if (image.owner_back && !image.owner_front) {
                        reject({message: 'Owner_front is required.'});
                      }
                      else if (image.owner_front && !image.owner_back) {
                        Attachments.createAttachments(image.owner_front, {}, 'phone').then(res => {
                          let file_owner_front = res.imgId;
                          let owner = [];
                          for(var i = 0; i < file_owner_front.length; i++) {
                            owner.push({
                              name: data.owner_full_name[i],
                              identification_type: data.owner_type[i],
                              identification_number: data.owner_id_number[i],
                              identification_proof: {
                                front: file_owner_front[i]
                              }
                            });
                          }

                          Properties
                            .findByIdAndUpdate(result[0]._id, {
                              $set: {
                                'owned_type': 'individual',
                                'temp.owner.name': data.full_name,
                                'temp.owner.identification_type': data.type,
                                'temp.owner.identification_number': data.id_number,
                                'temp.owner.identification_proof.front': file_front,
                                'temp.owner.identification_proof.back': file_back,
                                'temp.shareholders': owner
                              }
                            })
                            .exec((err, udpate) => {
                              err ? reject({message: err.message})
                                  : resolve({message: 'Success'});
                            });
                        });
                      }
                      else if (image.owner_front && image.owner_back) {
                        Attachments.createAttachments(image.owner_front, {}, 'phone').then(res => {
                          let file_owner_front = res.imgId;
                          Attachments.createAttachments(image.owner_back, {}, 'phone').then(res => {
                            let file_owner_back = res.imgId;
                            let owner = [];
                            for(var i = 0; i < file_owner_front.length; i++) {
                              owner.push({
                                name: data.owner_full_name[i],
                                identification_type: data.owner_type[i],
                                identification_number: data.owner_id_number[i],
                                identification_proof: {
                                  front: file_owner_front[i],
                                  back: file_owner_back[i]
                                }
                              });
                            }

                            Properties
                              .findByIdAndUpdate(result[0]._id, {
                                $set: {
                                  'owned_type': 'individual',
                                  'temp.owner.name': data.full_name,
                                  'temp.owner.identification_type': data.type,
                                  'temp.owner.identification_number': data.id_number,
                                  'temp.owner.identification_proof.front': file_front,
                                  'temp.owner.identification_proof.back': file_back,
                                  'temp.shareholders': owner
                                }
                              })
                              .exec((err, udpate) => {
                                err ? reject({message: err.message})
                                    : resolve({message: 'Success'});
                              });
                          });
                        });
                      }
                      else {
                        Properties
                          .findByIdAndUpdate(result[0]._id, {
                            $set: {
                              'owned_type': 'individual',
                              'temp.owner.name': data.full_name,
                              'temp.owner.identification_type': data.type,
                              'temp.owner.identification_number': data.id_number,
                              'temp.owner.identification_proof.front': file_front,
                              'temp.owner.identification_proof.back': file_back
                            }
                          })
                          .exec((err, udpate) => {
                            err ? reject({message: err.message})
                                : resolve({message: 'Success'});
                          });
                      }
                    });
                  }
                  else {
                    if (image.owner_back && !image.owner_front) {
                      reject({message: 'Owner_front is required.'});
                    }
                    else if (image.owner_front && !image.owner_back) {
                      Attachments.createAttachments(image.owner_front, {}, 'phone').then(res => {
                        let file_owner_front = res.imgId;
                        let owner = [];
                        for(var i = 0; i < file_owner_front.length; i++) {
                          owner.push({
                            name: data.owner_full_name[i],
                            identification_type: data.owner_type[i],
                            identification_number: data.owner_id_number[i],
                            identification_proof: {
                              front: file_owner_front[i]
                            }
                          });
                        }

                        Properties
                          .findByIdAndUpdate(result[0]._id, {
                            $set: {
                              'owned_type': 'individual',
                              'temp.owner.name': data.full_name,
                              'temp.owner.identification_type': data.type,
                              'temp.owner.identification_number': data.id_number,
                              'temp.owner.identification_proof.front': file_front,
                              'temp.shareholders': owner
                            }
                          })
                          .exec((err, udpate) => {
                            err ? reject({message: err.message})
                                : resolve({message: 'Success'});
                          });
                        });
                    }
                    else if (image.owner_front && image.owner_back) {
                      Attachments.createAttachments(image.owner_front, {}, 'phone').then(res => {
                        let file_owner_front = res.imgId;
                        Attachments.createAttachments(image.owner_back, {}, 'phone').then(res => {
                          let file_owner_back = res.imgId;
                          let owner = [];
                          for(var i = 0; i < file_owner_front.length; i++) {
                            owner.push({
                              name: data.owner_full_name[i],
                              identification_type: data.owner_type[i],
                              identification_number: data.owner_id_number[i],
                              identification_proof: {
                                front: file_owner_front[i],
                                back: file_owner_back[i]
                              }
                            });
                          }

                          Properties
                            .findByIdAndUpdate(result[0]._id, {
                              $set: {
                                'owned_type': 'individual',
                                'temp.owner.name': data.full_name,
                                'temp.owner.identification_type': data.type,
                                'temp.owner.identification_number': data.id_number,
                                'temp.owner.identification_proof.front': file_front,
                                'temp.shareholders': owner
                              }
                            })
                            .exec((err, udpate) => {
                              err ? reject({message: err.message})
                                  : resolve({message: 'Success'});
                            });
                        });
                      });
                    }
                    else {
                      Properties
                        .findByIdAndUpdate(result[0]._id, {
                          $set: {
                            'owned_type': 'individual',
                            'temp.owner.name': data.full_name,
                            'temp.owner.identification_type': data.type,
                            'temp.owner.identification_number': data.id_number,
                            'temp.owner.identification_proof.front': file_front
                          }
                        })
                        .exec((err, udpate) => {
                          err ? reject({message: err.message})
                              : resolve({message: 'Success'});
                        });
                    }
                  }
                });
              }
              else {
                reject({message: 'Front is required'});
              }
            }
          }
        })
  });
});

propertiesSchema.static('step3Company', (properties: Object, userId: Object, files: Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
    let body: any = properties;
    let file: any = files;
    Properties
        .find({"owner.user": userId, "status": "draft"})
        .exec((err, result) => {
          if (err) {
            reject({message: err.message});
          }
          else {
            if (result.length == 0) {
              reject({message: 'Fill step 1 first.'});
            }
            else {
              if ( body.select_company && body.select_company != '' ) {
                result[0].owner.company = body.select_company;
                result[0].save();
              }
              else {
                if ( file.company_document ) {
                  Attachments.createAttachments(file.company_document, {}, 'phone').then(doc => {
                    let companyData = {
                      name: body.name,
                      registration_number: body.company_number,
                      documents: doc.imgId
                    };
                    Companies.createCompanies(companyData, userId).then(res => {
                      let companyId = res.companiesId;
                      result[0].owner.company = companyId;
                      result[0].save();
                    });
                  });
                }
                else {
                  reject({message: 'required company_document.'});
                }
                
              }
              if ( file.shareholder_front ) {
                Attachments.createAttachments(file.shareholder_front, {}, 'desktop').then(front => {
                  Attachments.createAttachments(file.shareholder_back, {}, 'desktop').then(back => {
                    let shareholders = [];
                    for ( var i = 0; i < front.idAtt.length; i++ ) {
                      shareholders.push({
                        name: body.shareholder_full_name[i],
                        identification_type: body.shareholder_type[i],
                        identification_number: body.shareholder_id_number[i],
                        identification_proof: {
                          front: front.idAtt[i],
                          back: back.idAtt[i]
                        }
                      }); 
                    }
                    result[0].temp.shareholders = shareholders;
                    result[0].save();
                  })
                })
              }
              result[0].owned_type = 'company';
              result[0].save((err, step3) => {
                err ? reject({message: err.message})
                    : resolve({message: 'Success'});
              })
            }
          }
        });
  });
});

propertiesSchema.static('step4', (properties: Object, userId: Object, device: string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
    let body: any = properties;
    Properties
        .find({"owner.user": userId, "status": "draft"})
        .exec((err, result) => {
          if (err) {
            reject({message: err.message});
          }
          else {
            if (result.length == 0) {
              reject({message: 'Fill step 1 first.'});
            }
            else {
              let times = body.times;

              let _days = [];
              let _time_from = [];
              let errorDays = false;
              let errorTimes = false;
              if (times.length > 0) {
                for ( var t = 0; t < times.length; t++) {
                  let days = times[t].days;
                  let time_from = times[t].time_form;
                  let start_date = times[t].date;

                  if (days.length > 0) {
                    for ( var i = 0; i < days.length; i++ ) {
                      if ( _days.indexOf(days[i]) == -1 ) {
                        _days.push(days[i]);
                      }
                      else {
                        errorDays = true;
                      }
                    }
                    if ( errorDays == true) {
                      reject({message: "Can't select same day for more than 1 schedule."});
                    }
                    else {
                      if ( time_from.length > 0 ) {
                        for ( var j = 0; j < time_from.length; j++ ) {
                          let f_h = time_from[j].time_from_hours;
                          let f_m = time_from[j].time_from_minutes;
                          let t_h = time_from[j].time_to_hours;
                          let t_m = time_from[j].time_to_minutes;

                          if ( t_h < f_h ) {
                            errorTimes = true;
                            reject({message: "From Time can't be bigger than To Time"});
                          }
                          else if ( t_h == f_h && f_m > t_m ) {
                            errorTimes = true;
                            reject({message: "From Time can't be bigger than To Time"});
                          }
                          else {
                            for( var k = 0; k < _time_from.length; k++ ) {
                              if ( f_h <= _time_from[k].f_h && t_h >= _time_from[k].t_h ) {
                                errorTimes = true;
                                reject({message: "Can't have from time lower than existing from time but to time higher than existing to time."});
                              }
                              else if ( f_h == _time_from[k].f_h && t_h == _time_from[k].t_h && f_m <= _time_from[k].f_m && t_m >= _time_from[k].t_m ) {
                                errorTimes = true;
                                reject({message: "Can't have from time lower than existing from time but to time higher than existing to time."});
                              }
                              else if ( f_h == _time_from[k].f_h && t_h == _time_from[k].t_h && f_m <= _time_from[k].f_m && t_m <= _time_from[k].t_m ) {
                                errorTimes = true;
                                reject({message: "Can't have time between existing time."});
                              }
                              else if ( f_h == _time_from[k].f_h && t_h == _time_from[k].t_h && f_m >= _time_from[k].f_m && t_m >= _time_from[k].t_m ) {
                                errorTimes = true;
                                reject({message: "Can't have time between existing time."});
                              }
                              else if ( f_h == _time_from[k].f_h && t_h == _time_from[k].t_h && f_m >= _time_from[k].f_m && t_m <= _time_from[k].t_m ) {
                                errorTimes = true;
                                reject({message: "Can't have time between existing time."});
                              }
                              else if ( f_h <= _time_from[k].f_h && t_h <= _time_from[k].t_h && t_h >= _time_from[k].f_h ) {
                                errorTimes = true;
                                reject({message: "Can't have time between existing time."});
                              }
                              else if ( f_h >= _time_from[k].f_h && t_h <= _time_from[k].t_h && t_h >= _time_from[k].f_h ) {
                                errorTimes = true;
                                reject({message: "Can't have time between existing time."});
                              }
                              else if ( f_h >= _time_from[k].f_h && t_h >= _time_from[k].t_h && (f_h < _time_from[k].t_h || f_h == _time_from[k].t_h && f_m <= _time_from[k].t_m )) {
                                errorTimes = true;
                                reject({message: "Can't have time between existing time."});
                              }
                              else {
                                _time_from.push({
                                  f_h: f_h,
                                  f_m: f_m,
                                  t_h: t_h,
                                  t_m: t_m
                                });
                              }
                            }
                          }
                        }
                      }
                      else {
                        reject({message: 'Required 1 time_from'});
                      }
                    }
                  }
                  else {
                    reject({message: 'Please select minimal 1 day to your schedules.'});
                  }
                }

                if ( errorTimes == false ) {
                  let push_schedules = [];
                  for ( var time = 0; time < times.length; time++ ) {
                    for ( var day = 0; day < times[time].days.length; day++ ) {
                      for ( var time_from = 0; time_from < times[time].time_form.length; time_from++ ) {
                        push_schedules.push({
                          day: times[time].days[day],
                          start_date: moment(times[time].date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                          time_from: times[time].time_form[time_from].time_from_hours+':'+times[time].time_form[time_from].time_from_minutes,
                          time_to: times[time].time_form[time_from].time_to_hours+':'+times[time].time_form[time_from].time_to_minutes,
                        });
                      }
                    }
                  }
                  result[result.length - 1].schedules = push_schedules;
                  result[result.length - 1].save((err, res) => {
                    if ( err ) {
                      console.log(err);
                      reject({ message: err.message });
                    }
                    else {
                      if ( device != 'desktop' ) {
                        Properties.getById(res._id, userId, 'phone').then(r => {
                          resolve(r);
                        })
                      }
                      else {
                        resolve(res);
                      }
                    }
                  })
                }
              } 
              else {
                reject({message: 'Please add minimal 1 schedule.'});
              }
            }
          }
        });
  });
});

propertiesSchema.static('step5', (userId: Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      Properties
        .find({"owner.user": userId, "status": "draft"})
        .exec((err, result) => {
          if (err) {
            reject({message: err.message});
          }
          else {
            if (result.length == 0) {
              reject({message: 'Fill step 1 first.'});
            }
            else {
              Properties
                .findByIdAndUpdate(result[0]._id, {
                  $set: {
                    'status': 'pending'
                  }
                })
                .exec((err, udpate) => {
                  err ? reject({message: err.message})
                      : resolve({message: 'Success'});
                });
            }
          }
        })
  });
});

propertiesSchema.static('getSchedules', (propertyId: Object, device: String):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
    Properties.findById(propertyId).populate('development').exec(( err, property ) => {
      if ( err ) {
        reject({message: 'No property with id '+propertyId});
      }
      else {
        let schedules = property.schedules;
        let name = '#'+property.address.floor+' - '+property.address.unit+' '+property.development.name;
        
        let schedules_data = [];
        let date_arr = [];
        let schedule = [];
        for ( var i = 0; i < schedules.length; i++ ) {
          let time_to = schedules[i].time_to.split(":");
          let time_from = schedules[i].time_from.split(":");
          let diff_h = time_to[0] - time_from[0];
          let diff_m = time_to[1] - time_from[1];
          let slot = (diff_h*2) + (diff_m/30);
          
          
          if ( date_arr.indexOf(schedules[i].start_date) == -1) {
            date_arr.push(schedules[i].start_date);
          }
          let count = 0;
          let index = 0;
          for ( var j = 0; j < schedule.length; j++ ) {
            if ( schedule[j].start_date == schedules[i].start_date ) {
              count += 1;
              index = j;
            }
          }
          let arr_id = 0;
          if ( count == 0 ) {
            schedule.push({
              start_date: schedules[i].start_date,
              time: [schedules[i]._id]
            });
          }
          else {
            arr_id = schedule[index].time.length + 1;
            schedule[index].time.push(schedules[i]._id);
          }

          schedules_data.push({
            _id: schedules[i]._id,
            day: schedules[i].day,
            date: schedules[i].start_date,
            time_to: schedules[i].time_to,
            time_from: schedules[i].time_from,
            property: {
              name: name,
              address: property.address.full_address
            },
            array_id: arr_id,
            form_index: date_arr.indexOf(schedules[i].start_date),
            user: property.owner.user,
            slot30min: slot
          });
        }
        resolve(schedules_data);
      }
    })
  });
});

propertiesSchema.static('getSchedulesByDate', (propertyId: Object, date: string, device: string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
    Appointments
      .find({})
      .populate('property')
      .exec(( err, appointments ) => {
      if ( err ) {
        reject({message: 'No appointments.'});
      }
      else {
        let dateName = moment(date).format('dddd');
        for ( var a = 0; a < appointments.length; a++ ) {
          let _appointments = appointments[a];
          Properties.getSchedules(propertyId).then(res => {
            let schedules = [];
            for ( var i = 0; i < res.length; i++ ) {
              let res_date = res[i].date;
              let _fullDate = moment(res_date).format("YYYY-MM-DD");
              if ( _fullDate <= date && res[i].day == dateName) {
                let status;
                if(_appointments.property) {
                  if ( 
                    res[i].property.address == _appointments.property.address.full_address && 
                    res[i].date == _appointments.chosen_time.date && 
                    res[i].time_from == _appointments.chosen_time.from
                  ) {
                    if ( _appointments.status == 'pending') {
                      status = 'Pending Confirmation';  
                    }
                    else {
                      status = _appointments.status.charAt(0).toUpperCase() + _appointments.status.slice(1);
                    }
                    
                  }
                  else {
                    status = 'Available';
                  }
                  schedules.push({
                    id: res[i]._id,
                    time: res[i].time_from,
                    time2: res[i].time_to,
                    idx: res[i].form_index > 9 ? res[i].form_index : '0'+res[i].form_index,
                    date: date,
                    status: status
                  });
                }
              }
            }
            resolve(schedules);
          });
        }
      }
    });
  });
});

let Properties = mongoose.model('Properties', propertiesSchema);

export default Properties;