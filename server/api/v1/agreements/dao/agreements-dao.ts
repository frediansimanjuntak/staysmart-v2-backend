import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import agreementsSchema from '../model/agreements-model';

agreementsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Agreements
          .find(_query)
          .exec((err, agreements) => {
              err ? reject(err)
                  : resolve(agreements);
          });
    });
});

agreementsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Agreements
          .findById(id)
          .exec((err, agreements) => {
              err ? reject(err)
                  : resolve(agreements);
          });
    });
});

agreementsSchema.static('createAgreements', (agreements:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(agreements)) {
        return reject(new TypeError('User is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = agreements;
      
      var _agreements = new Agreements(agreements);
          _agreements.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

agreementsSchema.static('deleteAgreements', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Agreements
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

agreementsSchema.static('updateAgreements', (id:string, agreements:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(agreements)) {
          return reject(new TypeError('Bank is not a valid object.'));
        }

        Agreements
        .findByIdAndUpdate(id, agreements)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Agreements = mongoose.model('Agreements', agreementsSchema);

export default Agreements;