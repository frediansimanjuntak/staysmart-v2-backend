import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import amenitiesSchema from '../model/amenities-model';
import Attachments from '../../attachments/dao/attachments-dao'
import {amenityHelper} from '../../../../helper/amenity.helper';

amenitiesSchema.static('getAll', (headers: Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Amenities
          .find(_query)
          .populate("icon")
          .exec((err, amenities) => {
             if (err) {
               reject({message: err.message});
             }
             else {
                amenityHelper.getAll(amenities, headers).then(result => {
                 resolve(result);
                })
             }
          });
    });
});

amenitiesSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Amenities
          .findById(id)
          .populate("icon")
          .exec((err, amenities) => {
              err ? reject({message: err.message})
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
            err ? reject({message: err.message})
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
          .findById(id, (err, amenities) => {
            Attachments.deleteAttachments(amenities.icon);
          })
          .exec((err, deleted) => {
              err ? reject({message: err.message})
                  : resolve();
          });
        Amenities
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject({message: err.message})
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
        .exec((err, update) => {
              err ? reject({message: err.message})
                  : resolve(update);
          });
    });
});

let Amenities = mongoose.model('Amenities', amenitiesSchema);

export default Amenities;