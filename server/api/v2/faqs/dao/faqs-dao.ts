import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import faqsSchema from '../model/faqs-model';

faqsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Faqs
          .find(_query)
          .populate("created_by")
          .exec((err, faqs) => {
              err ? reject(err)
                  : resolve(faqs);
          });
    });
});

faqsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Faqs
          .findById(id)
          .populate("created_by")
          .exec((err, faqs) => {
              err ? reject(err)
                  : resolve(faqs);
          });
    });
});

faqsSchema.static('getByFilter', (filter:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Faqs
          .find({'for': filter})
          .exec((err, faqs) => {
              err ? reject(err)
                  : resolve(faqs);
          });
    });
});

faqsSchema.static('createFaqs', (faqs:Object, created_by:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(faqs)) {
        return reject(new TypeError('FAQ is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = faqs;
      
      var _faqs = new Faqs(faqs);
          _faqs.created_by = created_by;
          _faqs.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

faqsSchema.static('deleteFaqs', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Faqs
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

faqsSchema.static('updateFaqs', (id:string, faqs:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(faqs)) {
          return reject(new TypeError('FAQ is not a valid object.'));
        }

        Faqs
        .findByIdAndUpdate(id, faqs)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Faqs = mongoose.model('Faqs', faqsSchema);

export default Faqs;