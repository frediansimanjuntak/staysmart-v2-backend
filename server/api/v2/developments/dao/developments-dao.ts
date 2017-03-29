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
        var development = Developments.find(_query);

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
          development.where({'address.coordinates': { $geoWithin: { $centerSphere: [ lnglat, radius/3963.2 ] } } });
        }
        if(search.location != 'all') 
        {
          development.where('address.street_name', search.location);
        }
        development.populate("properties")
        development.exec((err, result) => {
          var dev = [];
          for(var i = 0; i < result.length; i++){
            var countDev = 0;
            for(var p = 0; p < result[i].properties.length; p++){
              if(search.pricemin != 'all') {
                if(result[i].properties[p].details.price >= search.pricemin){
                  countDev += 1;
                }
              }
              else{
                countDev += 1;
              }
              if(search.pricemax != 'all') {
                if(result[i].properties[p].details.price <= search.pricemax){
                  countDev += 1;
                }
              }
              else{
                countDev += 1;
              }
              if(search.bedroomCount != 'all') 
              {
                var bedroom = split(search.bedroomCount, {sep: ','});
                for(var j = 0; j < bedroom.length; j++){
                  if(bedroom[j] == 5) {
                    if(result[i].properties[p].details.bedroom >= bedroom[j]) {
                      countDev += 1;
                    }
                  }  
                  else{
                    if(result[i].properties[p].details.bedroom == bedroom[j]) {
                      countDev += 1;
                    }  
                  }
                }
              }
              else{
                countDev += 1;
              }
              if(search.bathroomCount != 'all') 
              {
                var bathroom = split(search.bathroomCount, {sep: ','});
                for(var j = 0; j < bathroom.length; j++){
                  if(bathroom[j] == 5) {
                    if(result[i].properties[p].details.bathroom >= bathroom[j]) {
                      countDev += 1;
                    }
                  }  
                  else{
                    if(result[i].properties[p].details.bathroom == bathroom[j]) {
                      countDev += 1;
                    }  
                  }
                }
              }
              else{
                countDev += 1;
              }
              if(search.available != 'all') 
              {
                if(result[i].properties[p].details.available >= search.available){
                  countDev += 1;
                }
              }
              else{
                countDev += 1;
              }
              if(search.sizemin != 'all') 
              {
                if(result[i].properties[p].details.size_sqf >= search.sizemin){
                  countDev += 1;
                }
              }
              else{
                countDev += 1;
              }
              if(search.sizemax != 'all') 
              {
                if(result[i].properties[p].details.size_sqf <= search.sizemax){
                  countDev += 1;
                }
              }
              else{
                countDev += 1;
              }
            }
            if(countDev > 0) {
              dev.push(result[i]);
            }
          }
          resolve(dev);
        })
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