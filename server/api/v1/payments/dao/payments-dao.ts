import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import paymentsSchema from '../model/payments-model';

paymentsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Payments
          .find(_query)
          .exec((err, payments) => {
              err ? reject(err)
                  : resolve(payments);
          });
    });
});

paymentsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Payments
          .findById(id)
          .exec((err, payments) => {
              err ? reject(err)
                  : resolve(payments);
          });
    });
});

paymentsSchema.static('createPayments', (payments:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(payments)) {
        return reject(new TypeError('User is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = payments;
      
      var _payments = new Payments(payments);
          _payments.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

paymentsSchema.static('deletePayments', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Payments
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

paymentsSchema.static('updatePayments', (id:string, payments:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(payments)) {
          return reject(new TypeError('Bank is not a valid object.'));
        }

        Payments
        .findByIdAndUpdate(id, payments)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Payments = mongoose.model('Payments', paymentsSchema);

export default Payments;