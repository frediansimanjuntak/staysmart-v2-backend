import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as newrelic from 'newrelic';
import appointmentsSchema from '../model/appointments-model';
import Users from '../../users/dao/users-dao'
import Properties from '../../properties/dao/properties-dao'
import Notifications from '../../notifications/dao/notifications-dao'
import Developments from '../../developments/dao/developments-dao'
import Agreements from '../../agreements/dao/agreements-dao';
import {mail} from '../../../../email/mail';

appointmentsSchema.static('getStatus', ():Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {

  })
})

appointmentsSchema.static('getAll', (userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        var ObjectID = mongoose.Types.ObjectId;  

        Appointments
          .find({ $or: [ { "landlord": ObjectID(userId) }, { "tenant": ObjectID(userId) } ] })
          .populate("landlord tenant agreement")
          .populate({
            path: 'property',
            populate: [{
              path: 'pictures.living',
              model: 'Attachments'
            },{
              path: 'pictures.dining',
              model: 'Attachments'
            },{
              path: 'pictures.bed',
              model: 'Attachments'
            },{
              path: 'pictures.toilet',
              model: 'Attachments'
            },{
              path: 'pictures.kitchen',
              model: 'Attachments'
            },{
              path: 'development',
              model: 'Developments'
            }]
          })
          .exec((err, appointments) => {
              if(err) {
                reject(err);
                newrelic.noticeError(err);
              }
              else{
                resolve(appointments);
              }
          });
    });
});

appointmentsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Appointments
          .findById(id)
          .populate("landlord tenant agreement")
          .populate({
            path: 'property',
            populate: [{
              path: 'pictures.living',
              model: 'Attachments'
            },{
              path: 'pictures.dining',
              model: 'Attachments'
            },{
              path: 'pictures.bed',
              model: 'Attachments'
            },{
              path: 'pictures.toilet',
              model: 'Attachments'
            },{
              path: 'pictures.kitchen',
              model: 'Attachments'
            },{
              path: 'development',
              model: 'Developments'
            }]
          })
          .exec((err, appointments) => {
              if(err) {
                reject(err);
                newrelic.noticeError(err);
              }
              else{
                resolve(appointments);
              }
          });
    });
});

appointmentsSchema.static('createAppointments', (appointments:Object, tenant:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(appointments)) {
        return reject(new TypeError('Appointment is not a valid object.'));
      }
      let tenantId = tenant.toString();
      let body:any = appointments;

      Properties
        .findById(body.property)
        .populate("owner.user development")
        .exec((err, property) => {
          if(err){
            reject(err);
          }
          else{
            let landlordId = property.owner.user._id;
            let propertyId = property._id;
            let data = {
              "property": body.property
            };
            Agreements.createAgreements(data, tenant).then(res => {
              let agreementId = res.agreement_id;
              for(var i = 0; i < body.time.length; i++){
                var _appointments = new Appointments(appointments);
                _appointments.agreement = agreementId;
                _appointments.landlord = landlordId;
                _appointments.tenant = tenant;
                _appointments.chosen_time.date = body.date;
                _appointments.chosen_time.from = body.time[i];
                _appointments.chosen_time.to = body.time2[i];
                _appointments.save((err, saved)=>{
                  if(err) {
                    reject(err);
                    newrelic.noticeError(err);
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
                        resolve({appoinment_id: saved._id, message: 'appoinment proposed'});
                      })
                  }
                })
              }
            });            
          }
        })     
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
              newrelic.noticeError();
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
                      "message": "Appointment "+status+" for "+unit+" "+appointment.property.development.name+" at "+appointment.chosen_time.date+" from "+appointment.chosen_time.from+" to "+appointment.chosen_time.to,
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
                    resolve({message: 'appointment updated'});
                  })
              }
              else{
                resolve({message: 'appointment updated'});
              }
            }
        });
    });
});

let Appointments = mongoose.model('Appointments', appointmentsSchema);

export default Appointments;