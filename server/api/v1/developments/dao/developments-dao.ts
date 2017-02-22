import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import developmentsSchema from '../model/developments-model';

developmentsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Developments
          .find(_query)
          .exec((err, developments) => {
              err ? reject(err)
                  : resolve(developments);
          });
    });
});

developmentsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Developments
          .findById(id)
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
      
      var _developments = new Developments(developments);
          _developments.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

developmentsSchema.static('deleteDevelopments', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

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
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Developments = mongoose.model('Developments', developmentsSchema);

export default Developments;