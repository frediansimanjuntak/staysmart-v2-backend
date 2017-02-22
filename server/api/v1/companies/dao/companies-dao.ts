import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import companiesSchema from '../model/companies-model';
import Attachments from '../../attachments/dao/attachments-dao'

companiesSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Companies
          .find(_query)
          .exec((err, companies) => {
              err ? reject(err)
                  : resolve(companies);
          });
    });
});

companiesSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Companies
          .findById(id)
          .exec((err, companies) => {
              err ? reject(err)
                  : resolve(companies);
          });
    });
});

companiesSchema.static('createCompanies', (companies:Object, attachment:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(companies)) {
        return reject(new TypeError('Company is not a valid object.'));
      }
        var ObjectID = mongoose.Types.ObjectId;  
        let body:any = companies;

        var _companies = new Companies(companies);
            _companies.save((err, saved)=>{
              err ? reject(err)
                  : resolve(saved);
              });

        var companiesId=_companies._id;

        Attachments.createAttachments(attachment).then(res => {
          var idAttachment=res.idAtt;
          Companies
            .findByIdAndUpdate(companiesId, {
              $push : {
                "document": idAttachment
              }
            })
            .exec((err, update) => {
                err ? reject(err)
                    : resolve(update);
            });
        

        });


    });
});

companiesSchema.static('deleteCompanies', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

          Companies
            .findById(id, (err,companies) => {
                if(companies.document != null) {
                    var ObjectID = mongoose.Types.ObjectId;
                    var companies_document = [].concat(companies.document)
                        for (var i = 0; i < companies_document.length; i++) {
                            let document = companies_document[i];
                            Attachments
                                .findByIdAndRemove(document)
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

          Companies
            .findByIdAndRemove(id)
            .exec((err, deleted) => {
                err ? reject(err)
                    : resolve();
            });
        
    });
});

companiesSchema.static('updateCompanies', (id:string, companies:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(companies)) {
          return reject(new TypeError('Company is not a valid object.'));
        }

        Companies
        .findByIdAndUpdate(id, companies)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Companies = mongoose.model('Companies', companiesSchema);

export default Companies;