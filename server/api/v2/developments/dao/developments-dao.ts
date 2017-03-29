import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import developmentsSchema from '../model/developments-model';
import Properties from "../../properties/dao/properties-dao";
var split = require('split-string');

developmentsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Developments
          .find(_query)
          .populate("properties")
          .exec((err, developments) => {
              err ? reject(err)
                  : resolve(developments);
          });
    });
});

developmentsSchema.static('developmentsMap', (searchComponent: Object):Promise<any> => {
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
          if(err) {
            reject(err);
          }
          else{
            var dev = [];
            for(var i = 0; i < properties.length; i++){
              let dev_data = properties[i].development;
              if(dev.length > 0) {
                for(var j = 0; j < dev.length; j++){
                  if(dev[j].development._id === dev_data._id) {
                    dev[j].count += 1;
                  }
                  else{
                    dev.push({'development': dev_data, 'count': 1});    
                  }
                }
              }
              else{
                dev.push({'development': dev_data, 'count': 1});
              }
            }
            resolve(dev);
          }
        });
    });
});

developmentsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Developments
          .findById(id)
          .populate("properties")
          .exec((err, developments) => {
              err ? reject(err)
                  : resolve(developments);
          });
    });
});

developmentsSchema.static('getDevelopment', (unit:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};
        Developments
          .find(_query)
          .where('number_of_units').gt(unit)
          .populate("properties")
          .exec((err, developments) => {
              err ? reject(err)
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
            err ? reject(err)
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
                                    err ? reject(err)
                                        : resolve(deleted);
                                });
                      }
              }
          })
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve(deleted);  
          });

        Developments
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
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
              err ? reject(err)
                  : resolve(update);
          });
    });
});

let Developments = mongoose.model('Developments', developmentsSchema);

export default Developments;