import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import developmentsSchema from '../model/developments-model';
import Properties from "../../properties/dao/properties-dao";
import {developmentHelper} from '../../../../helper/development.helper';
var split = require('split-string');

developmentsSchema.static('getAll', (device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Developments
          .find(_query)
          .populate("properties")
          .exec((err, developments) => {
             if (err) {
               reject({message: err.message});
             }
             else {
               if ( device != 'desktop' ) {
                developmentHelper.getAll(developments).then(result => {
                  resolve(result);
                })
               }
               else {
                 resolve(developments);
               }
             }
          });
    });
});

developmentsSchema.static('developmentsMap', (searchComponent: Object, from:string, headers:Object, request:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Properties.searchProperties(searchComponent, from, headers, request).then(properties => {
          var dev = [];
                    
          for(var i = 0; i < properties.length; i++){
            let property = properties[i];
            let development = property.development;
            if (dev.length == 0){
              dev.push({'development': development, 'count': 1});
            }
            else if (dev.length > 0){         
              let countMatch = 0;
              let developId;
              let index;     
              for(var j = 0; j < dev.length; j++){
                let devId = dev[j].development._id;
                let count = dev[j].count;
                if(devId == development._id){
                    countMatch += 1;
                    developId = devId;
                    index = j;
                }
                else{
                  countMatch = countMatch;
                }
              }
              if(countMatch > 0){
                dev[index].count += 1;
              }
              else{
                dev.push({'development': development, 'count': 1}); 
              }
            }
          }
          resolve(dev);
        })
    });
});

developmentsSchema.static('getPropertyDraftWithoutOwnerDevelopment', (id:string, data:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let body:any = data;

        Developments
          .findById(id)          
          .populate("properties")
          .select("properties")
          .exec((err, developments) => {
            if(err){
              reject({message: err.message});
            }
            if(developments){ 
              let dev;     
              for(var i = 0; i < developments.properties.length; i++){
                let property = developments.properties[i];
                if(property.status == "draft" && !property.owner.user){
                  if(property.address.floor == body.floor && property.address.unit == body.unit){
                    dev = property;
                  }
                }
              }
              if(dev == null){
                resolve({message: "no data"});
              }  
              else{
                resolve(dev);
              }
            }
          });
    });
});

developmentsSchema.static('getDevUnit', (request: Object, userId: Object, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      let body: any = request;
      Properties.find({"development": body.development, "address.floor": body.unit_no, "address.unit": body.unit_no_2})
                .populate('development')
                .exec((err, result) => {
                  if (err) { reject({message: err.messsage}); }
                  else {
                    let data = result[0];
                    resolve({
                      address: {
                        unit_no: data.address.floor,
                        unit_no_2: data.address.unit,
                        coordinates: [Number(data.address.coordinates[0]), Number(data.address.coordinates[1])],
                        full_address: data.address.full_address,
                        block_no: data.address.block_number,
                        street_name: data.address.street_name,
                        postal_district: '',
                        postal_sector: '',
                        postal_code: String(data.address.postal_code),
                        type: data.address.type,
                        country: data.address.country
                      },
                      details: {
                        area_sqm: data.details.size_sqm,
                        type_of_area: data.development.type_of_area,
                        transacted_price: 0,
                        nett_price: '-',
                        price_psm: data.details.psqm,
                        price_psf: data.details.psqft,
                        sale_date: data.details.sale_date ? data.details.sale_date : '',
                        property_type: data.details.type ? data.details.type : '',
                        tenure: data.details.tenure ? data.details.tenure : '',
                        completion_date: data.details.completion_date ? Number(data.details.completion_date) : 2011,
                        type_of_sale: data.details.type_of_sale ? data.details.type_of_sale : '',
                        purchaser_address_indicator: data.details.purchaser_address_indicator ? data.details.purchaser_address_indicator : '',
                        planning_region: data.details.planning_region ? data.details.planning_region : '',
                        planning_area: data.details.planning_area ? data.details.planning_area : '',
                        area_sqf: data.details.size_sqf ? String(data.details.size_sqf) : ''
                      },
                      id: data._id
                    });
                  }
                })
    });
});

developmentsSchema.static('getPropertyWithOwnerDevelopment', (id:string, data:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let body:any = data;

        Developments
          .findById(id)          
          .populate("properties")
          .select("properties")
          .exec((err, developments) => {
            if(err){
              reject({message: err.message});
            }
            if(developments){
              let dev;     
              for(var i = 0; i < developments.properties.length; i++){
                let property = developments.properties[i];
                if(property.owner.user){
                  if(property.address.floor == body.floor && property.address.unit == body.unit){
                    dev = property;
                  }
                }
              }  
              if(dev == null){
                resolve({message: "no data"});
              }  
              else{
                resolve(dev);
              }
            }
          });
    });
});

developmentsSchema.static('getById', (id:string, userId:Object, device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Developments
          .findById(id)
          .populate("properties header_image image")
          .exec((err, developments) => {
            if (err) {
               reject({message: err.message});
            }
            else {
              if ( device != 'desktop' ) {
                developmentHelper.getById(developments, userId).then(result => {
                  resolve(result);
                })
              }
              else {
                resolve(developments);
              }
            }
          });
    });
});

developmentsSchema.static('getDevelopment', (unit:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};
        Developments
          .find(_query)
          .where('number_of_units').gt(unit)
          .populate("properties header_image image")
          .exec((err, developments) => {
              err ? reject({message: err.message})
                  : resolve(developments);
          });
    });
});

developmentsSchema.static('createDevelopments', (developments:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(developments)) {
        return reject(new TypeError('Development is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = developments;
      var slug_name = Developments.slug(body.name);

      var _developments = new Developments(developments);
          _developments.slug = slug_name;
          _developments.save((err, saved)=>{
            err ? reject({message: err.message})
                : resolve(saved);
          });
    });
});

developmentsSchema.static('slug', (text:string):Promise<any> => {
  return text.toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
  }
);

developmentsSchema.static('deleteDevelopments', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Developments
          .findById(id, (err,developments) => {
            if(developments.properties != null){
              var ObjectID = mongoose.Types.ObjectId;
              var developments_properties =  [].concat(developments.properties)
              for  (var i=0; i < developments_properties.length; i++) {
                let properties = developments_properties[i];
                Properties
                  .findByIdAndRemove(properties)
                  .exec((err, deleted) => {
                    if(err) {
                      reject({message: err.message});
                    }
                  });
              }
            }
          })
          .exec((err, deleted) => {
              if(err) {
                reject({message: err.message});
              } 
              else{
                Developments
                  .findByIdAndRemove(id)
                  .exec((err, deleted) => {
                      err ? reject({message: err.message})
                          : resolve();
                  });
              }
          });
    });
});

developmentsSchema.static('updateDevelopments', (id:string, developments:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(developments)) {
          return reject(new TypeError('Development is not a valid object.'));
        }

        Developments
        .findByIdAndUpdate(id, developments)
        .exec((err, update) => {
          err ? reject({message: err.message})
              : resolve(update);
        });
    });
});

let Developments = mongoose.model('Developments', developmentsSchema);

export default Developments;