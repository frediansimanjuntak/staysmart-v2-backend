import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import appointmentsSchema from '../model/appointments-model';

appointmentsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Appointments
          .find(_query)
          .exec((err, appointments) => {
              err ? reject(err)
                  : resolve(appointments);
          });
    });
});

appointmentsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Appointments
          .findById(id)
          .exec((err, appointments) => {
              err ? reject(err)
                  : resolve(appointments);
          });
    });
});

appointmentsSchema.static('createAppointments', (appointments:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(appointments)) {
        return reject(new TypeError('User is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = appointments;
      
      var _appointments = new Appointments(appointments);
          _appointments.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

appointmentsSchema.static('deleteAppointments', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Appointments
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

appointmentsSchema.static('updateAppointments', (id:string, appointments:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(appointments)) {
          return reject(new TypeError('Bank is not a valid object.'));
        }

        Appointments
        .findByIdAndUpdate(id, appointments)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Appointments = mongoose.model('Appointments', appointmentsSchema);

export default Appointments;