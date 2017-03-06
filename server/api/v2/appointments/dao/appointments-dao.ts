import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import appointmentsSchema from '../model/appointments-model';
import Users from '../../users/dao/users-dao'
import Properties from '../../properties/dao/properties-dao'
import Notifications from '../../notifications/dao/notifications-dao'

appointmentsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Appointments
          .find(_query)
          .populate("landlord tenant property")
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
          .populate("landlord tenant property")
          .exec((err, appointments) => {
              err ? reject(err)
                  : resolve(appointments);
          });
    });
});

appointmentsSchema.static('createAppointments', (appointments:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(appointments)) {
        return reject(new TypeError('Appointment is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = appointments;
      
      var _appointments = new Appointments(appointments);
          _appointments.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved); 
          });
      var appointmentId = _appointments._id;

      var notification = {
        "user": body.landlord,
        "message": "Appointment proposed for "+body.choosen_time.date+" from "+body.choosen_time.from+" to "+body.choosen_time.to,
        "type": "appointment_proposed",
        "ref_id": appointmentId
      };
      Notifications.createNotifications(notification);   
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

appointmentsSchema.static('updateAppointments', (id:string, status:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(status)) {
          return reject(new TypeError('Status is not a valid string.'));
        }

        Appointments
        .findByIdAndUpdate(id, {
          $set: {
            "status": status
          }
        })
        .exec((err, updated) => {
            err ? reject(err)
                : resolve(updated);
        });
        Appointments
          .findById(id, (err, result) => {
            var notification = {
              "user": result.tenant,
              "message": "Appointment "+status+" for "+result.choosen_time.date+" from "+result.choosen_time.from+" to "+result.choosen_time.to,
              "type": "appointment_"+status,
              "ref_id": id
            };
            Notifications.createNotifications(notification);      
          })
          .exec((err, updated) => {
            err ? reject(err)
                : resolve(updated);
          });
    });
});

let Appointments = mongoose.model('Appointments', appointmentsSchema);

export default Appointments;