import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import banksSchema from '../model/banks-model';

banksSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Banks
          .find(_query)
          .exec((err, banks) => {
              err ? reject(err)
                  : resolve(banks);
          });
    });
});

banksSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Banks
          .findById(id)
          .exec((err, banks) => {
              err ? reject(err)
                  : resolve(banks);
          });
    });
});

banksSchema.static('createBanks', (banks:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(banks)) {
        return reject(new TypeError('User is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = banks;
      
      var _banks = new Banks(banks);
          _banks.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

banksSchema.static('deleteBanks', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Banks
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

banksSchema.static('updateBanks', (id:string, banks:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(banks)) {
          return reject(new TypeError('Bank is not a valid object.'));
        }

        Banks
        .findByIdAndUpdate(id, banks)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Banks = mongoose.model('Banks', banksSchema);

export default Banks;