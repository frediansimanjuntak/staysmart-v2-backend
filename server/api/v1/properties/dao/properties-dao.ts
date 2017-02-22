import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import propertiesSchema from '../model/properties-model';

propertiesSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Properties
          .find(_query)
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
          .exec((err, properties) => {
              err ? reject(err)
                  : resolve(properties);
          });
    });
});

propertiesSchema.static('createProperties', (properties:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(properties)) {
        return reject(new TypeError('Property is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = properties;
      
      var _properties = new Properties(properties);
          _properties.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

propertiesSchema.static('deleteProperties', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Properties
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

propertiesSchema.static('updateProperties', (id:string, properties:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(properties)) {
          return reject(new TypeError('Property is not a valid object.'));
        }

        Properties
        .findByIdAndUpdate(id, properties)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Properties = mongoose.model('Properties', propertiesSchema);

export default Properties;