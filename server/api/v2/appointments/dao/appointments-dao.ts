import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import appointmentsSchema from '../model/appointments-model';
import Users from '../../users/dao/users-dao'
import Properties from '../../properties/dao/properties-dao'
import Notifications from '../../notifications/dao/notifications-dao'
import Developments from '../../developments/dao/developments-dao'
import {mail} from '../../../../email/mail';

appointmentsSchema.static('getAll', (userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Appointments
          .find({ $or: [ { "landlord": userId }, { "tenant": userId } ] })
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

appointmentsSchema.static('createAppointments', (appointments:Object, tenant:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(appointments)) {
        return reject(new TypeError('Appointment is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = appointments;
      console.log(appointments);
      for(var i = 0; i < body.time.length; i++){
        var _appointments = new Appointments(appointments);
            _appointments.tenant = tenant;
            _appointments.chosen_time.date = body.date;
            _appointments.chosen_time.from = body.time[i];
            _appointments.chosen_time.to = body.time2[i];
            _appointments.save((err, saved)=>{
              if(err) {
                reject(err);
              }
              else if(saved){
                var appointmentId = _appointments._id;
                Appointments
                  .findById(appointmentId)
                  .populate("landlord tenant")
                  .populate({
                    path: 'property',
                    populate: {
                      path: 'development',
                      model: 'Developments',
                    },
                  })
                  .exec((err, appointment) => {
                    var devID = appointment.property.development;
                    var unit = '#'+appointment.property.address.floor+'-'+appointment.property.address.unit;
                    
                    var notification = {
                      "user": body.landlord,
                      "message": "Appointment proposed for "+unit+" "+appointment.property.development.name+" at "+body.date+" from "+body.time[i]+" to "+body.time2[i],
                      "type": "appointment_proposed",
                      "ref_id": appointmentId
                    };
                    Notifications.createNotifications(notification);  
                    var emailTo = appointment.landlord.email;
                    var fullname = appointment.landlord.username;
                    var tenant_username = appointment.tenant.username;                    
                    var full_address = appointment.property.address.full_address;
                    var from = 'Staysmart';

                    mail.proposedAppointment(emailTo, fullname, tenant_username, full_address, from);
                    resolve({message: 'appoinment proposed'});
                  })
              }
            });
      }
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
        .exec((err, update) => {
            if(err) {
              reject(err);
            }
            else if(update) {
              if(status == 'accepted' || status == 'rejected')
              {
                Appointments
                  .findById(id)
                  .populate("landlord tenant")
                  .populate({
                    path: 'property',
                    populate: {
                      path: 'development',
                      model: 'Developments',
                    },
                  })
                  .exec((err, appointment) => {
                    var devID = appointment.property.development;
                    var unit = '#'+appointment.property.address.floor+'-'+appointment.property.address.unit;
                    
                    var notification = {
                      "user": appointment.property.tenant,
                      "message": "Appointment "+status+" for "+unit+" "+appointment.property.development.name+" at "+appointment.property.choosen_time.date+" from "+appointment.property.choosen_time.from+" to "+appointment.property.choosen_time.to,
                      "type": "appointment_proposed",
                      "ref_id": id
                    };
                    Notifications.createNotifications(notification);  

                    var emailTo = appointment.tenant.email;
                    var fullname = appointment.tenant.username;
                    var full_address = appointment.property.address.full_address;
                    var landlord_username = appointment.landlord.username;
                    var from = 'Staysmart';

                    if(status == 'accepted') {
                      mail.confirmAppointment(emailTo, fullname, full_address, landlord_username, from);
                    }
                    else if(status == 'rejected') {
                      mail.rejectAppointment(emailTo, fullname, full_address, landlord_username, from);
                    }
                    resolve({message: 'appoinment updated'});
                  })
              }
            }
        });
    });
});

let Appointments = mongoose.model('Appointments', appointmentsSchema);

export default Appointments;