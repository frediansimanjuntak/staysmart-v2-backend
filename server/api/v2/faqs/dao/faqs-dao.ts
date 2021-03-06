import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import faqsSchema from '../model/faqs-model';

faqsSchema.static('getAll', (device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        let faqs = Faqs.find(_query);
        (device == 'desktop') ? faqs.populate("created_by"): '';
          faqs.exec((err, faqs) => {
            err ? reject({message: err.message})
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
            err ? reject({message: err.message})
                : resolve(faqs);
          });
    });
});

faqsSchema.static('getByFilter', (filter:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Faqs
          .find({'for': filter})
          .exec((err, faqs) => {
            err ? reject({message: err.message})
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
            err ? reject({message: err.message})
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
            err ? reject({message: err.message})
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
        .exec((err, update) => {
          err ? reject({message: err.message})
              : resolve(update);
        });
    });
});

let Faqs = mongoose.model('Faqs', faqsSchema);

export default Faqs;