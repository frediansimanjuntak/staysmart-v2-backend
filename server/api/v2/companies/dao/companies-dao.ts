import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import companiesSchema from '../model/companies-model';
import Attachments from '../../attachments/dao/attachments-dao'
import Users from '../../users/dao/users-dao'

companiesSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Companies
          .find(_query)
          .populate("documents created_by")
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
          .populate("documents created_by")
          .exec((err, companies) => {
              err ? reject(err)
                  : resolve(companies);
          });
    });
});

companiesSchema.static('createCompanies', (companies:Object, created_by:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(companies)) {
        return reject(new TypeError('Company is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = companies;

      var _companies = new Companies(companies);
          _companies.created_by = created_by;
          _companies.save((err, saved)=>{
            if(err) {
              reject(err);
            }
            else if(saved) {
              var companiesId = _companies._id;
              Users
                .findByIdAndUpdate(created_by, {
                  $push: {
                    "companies": companiesId
                  }
                })
                .exec((err, update) => {
                  if(err) {
                    reject(err);
                  }
                });
              resolve({companiesId});        
            }
          });
    });
});


companiesSchema.static('addCompaniesShareholders', (id:string, shareholder:Object, currentUser:string):Promise<any> =>{
  return new Promise((resolve:Function, reject:Function) => {
    if(!_.isString(id) && !_.isObject(shareholder)) {
      return reject(new TypeError('User data is not a valid object or id is not a valid string.'));
    }
    
    var ObjectID = mongoose.Types.ObjectId;  
    let body:any = shareholder;
    Companies
      .findById(id, (err, companies) => {
        Users.validateUser(companies.created_by, currentUser).then(res => {
          if(res.message) {
            reject({message: res.message});
          }
          else if(res == true){
            for (var i = 0; i < body.shareholders.length; i++) {
              Companies
                .findByIdAndUpdate(id, {
                  $push: {
                    "shareholders": body.shareholders[i]
                  }
                })
                .exec((err, update) => {
                  err ? reject(err)
                  : resolve(update);
                });  
            }
          }
        });    
      })
  });
});

companiesSchema.static('deleteCompanies', (id:string, currentUser:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Companies
          .findById(id, (err,companies) => {
            Users.validateUser(companies.created_by, currentUser).then(res => {
              if(res.message) {
                reject({message: res.message});
              }
              else if(res == true){
                if(companies.documents != null) {
                  var ObjectID = mongoose.Types.ObjectId;
                  var companies_documents = [].concat(companies.documents)
                  for (var i = 0; i < companies_documents.length; i++) {
                    let document = companies_documents[i];
                    Attachments
                      .findByIdAndRemove(document)
                      .exec((err, deleted) => {
                        if(err) {
                          reject(err);
                        }
                      });
                  }
                }
                Users
                  .findByIdAndUpdate(companies.created_by, {
                    $pull: {
                      "companies": id
                    }
                  })
                  .exec((err, update) => {
                    if(err) {
                      reject(err);
                    }
                    else{
                      Companies
                        .findByIdAndRemove(id)
                        .exec((err, deleted) => {
                            err ? reject(err)
                                : resolve(deleted);
                        });
                    }
                  });
              }
            });
          })
    });
});

companiesSchema.static('updateCompanies', (id:string, companies:Object, currentUser:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(companies)) {
          return reject(new TypeError('Company is not a valid object.'));
        }
        Companies
          .findById(id, (err, companies) => {
            Users.validateUser(companies.created_by, currentUser).then(res => {
              if(res.message) {
                reject({message: res.message});
              }
              else if(res == true){
                Companies
                  .findByIdAndUpdate(id, companies)
                  .exec((err, update) => {
                    err ? reject(err)
                        : resolve(update);
                  });
              }
            });    
          })
        
    }); 
});

let Companies = mongoose.model('Companies', companiesSchema);

export default Companies;