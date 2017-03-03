import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import amenitiesSchema from '../model/amenities-model';

amenitiesSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Amenities
          .find(_query)
          .exec((err, amenities) => {
              err ? reject(err)
                  : resolve(amenities);
          });
    });
});

amenitiesSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Amenities
          .findById(id)
          .exec((err, amenities) => {
              err ? reject(err)
                  : resolve(amenities);
          });
    });
});

amenitiesSchema.static('createAmenities', (amenities:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(amenities)) {
        return reject(new TypeError('Anmenity is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = amenities;
      
      var _amenities = new Amenities(amenities);
          _amenities.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

amenitiesSchema.static('deleteAmenities', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Amenities
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

amenitiesSchema.static('updateAmenities', (id:string, amenities:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(amenities)) {
          return reject(new TypeError('Amenity is not a valid object.'));
        }

        Amenities
        .findByIdAndUpdate(id, amenities)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Amenities = mongoose.model('Amenities', amenitiesSchema);

export default Amenities;