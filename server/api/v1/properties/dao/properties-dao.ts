import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import propertiesSchema from '../model/properties-model';
import Amenities from '../../amenities/dao/amenities-dao'
import Attachments from '../../attachments/dao/attachments-dao'
import Users from '../../users/dao/users-dao'
import Companies from '../../companies/dao/companies-dao'
import Developments from '../../developments/dao/developments-dao'

propertiesSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Properties
          .find(_query)
          .populate("amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company")
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
          .populate("amenities pictures.living pictures.dining pictures.bed pictures.toilet pictures.kitchen owner.user owner.company")
          .exec((err, properties) => {
              err ? reject(err)
                  : resolve(properties);
          });
    });
});

propertiesSchema.static('createProperties', (properties:Object, shareholder:Object, front:Object, back:Object):Promise<any> => {
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
      var propertyID =_properties._id;
      let shareholder_data:any = shareholder;
      let idFront = [];
      let idBack = [];
      Attachments.createAttachments(front).then(res => {
        idFront.push(res.idAtt);
      });
      Attachments.createAttachments(back).then(res => {
        idBack.push(res.idAtt);
      });
      
      Properties
        .findByIdAndUpdate(propertyID, {
          $push: {
            "shareholder.name": shareholder_data.name,
            "shareholder.identification_type": shareholder_data.identification_type,
            "shareholder.identification_number": shareholder_data.identification_number,
            "shareholder.identification_proof.front": idFront,
            "shareholder.identification_proof.back": idBack,
          }
        })
        .exec((err, saved) => {
            err ? reject(err)
                : resolve(saved);
        });

      Developments
        .findByIdAndUpdate(body.development, {
          $push: {
            "properties": propertyID
          }
        })
        .exec((err, saved) => {
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