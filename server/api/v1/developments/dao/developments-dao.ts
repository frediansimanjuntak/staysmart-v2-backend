import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import developmentsSchema from '../model/developments-model';
import Properties from "../../properties/dao/properties-dao";

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
      var slug_name = Developments.slug(body.name);

      var _developments = new Developments(developments);
          _developments.slug = slug_name;
          _developments.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

developmentsSchema.static('slug', (text:string):Promise<any> => {
  return text.toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
  }
);

developmentsSchema.static('deleteDevelopments', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Developments
          .findById(id, (err,developments) => {
              if(developments.properties != null){
                  var ObjectID = mongoose.Types.ObjectId;
                  var developments_properties =  [].concat(developments.properties)
                      for  (var i=0; i < developments_properties.length; i++) {
                            let properties = developments_properties[i];
                            Properties
                                .findByIdAndRemove(properties)
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