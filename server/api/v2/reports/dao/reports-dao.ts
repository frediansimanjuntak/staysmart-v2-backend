import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import reportsSchema from '../model/reports-model';

reportsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Reports
          .find(_query)
          .populate("reported reported")
          .exec((err, reports) => {
              err ? reject(err)
                  : resolve(reports);
          });
    });
});

reportsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Reports
          .findById(id)
          .populate("reported reported")
          .exec((err, reports) => {
              err ? reject(err)
                  : resolve(reports);
          });
    });
});

reportsSchema.static('createReports', (reports:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(reports)) {
        return reject(new TypeError('Notification is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = reports;
      
      var _reports = new Reports(reports);
          _reports.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

reportsSchema.static('deleteReports', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Reports
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

let Reports = mongoose.model('Reports', reportsSchema);

export default Reports;