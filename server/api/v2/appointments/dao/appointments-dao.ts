import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
// import * as newrelic from 'newrelic';
import appointmentsSchema from '../model/appointments-model';
import Users from '../../users/dao/users-dao'
import Properties from '../../properties/dao/properties-dao'
import Notifications from '../../notifications/dao/notifications-dao'
import Developments from '../../developments/dao/developments-dao'
import Agreements from '../../agreements/dao/agreements-dao';
import {mail} from '../../../../email/mail';

appointmentsSchema.static('getAppointment', (query:Object):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
      Appointments
          .find(query)
          .populate("agreement room")
          .populate({
            path: 'landlord',
            model: 'Users',
                  populate: {  
                    path: 'picture',
                    model: 'Attachments'
                  },
                  select: 'username email picture landlord.data'
          })
          .populate({
            path: 'tenant',
            model: 'Users',
                  populate: {
                    path: 'picture',
                    model: 'Attachments'
                  },
                  select: 'username email picture landlord.data'
          })
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
              if (err) {
                reject({message: err.message});
              }
              else {
                resolve(appointments);
              }
          });
  })
})

appointmentsSchema.static('getAll', (userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var ObjectID = mongoose.Types.ObjectId;  
        let _query = {};
        Appointments.getAppointment(_query).then(res => {
            resolve(res);
        })
        .catch((err)=>{
            reject(err.message);
        })        
    });
});

appointmentsSchema.static('getByProperty', (idproperty:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var ObjectID = mongoose.Types.ObjectId;  
        let _query = {"property": idproperty};
        Appointments.getAppointment(_query).then(res => {
            resolve(res);
        })
        .catch((err)=>{
            reject(err.message);
        })        
    });
});

appointmentsSchema.static('getByUser', (userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        var ObjectID = mongoose.Types.ObjectId;  
        let _query = {$or: [{"landlord": ObjectID(userId)}, {"tenant": ObjectID(userId)}]};
        Appointments.getAppointment(_query).then(res => {
            resolve(res);
        })
        .catch((err)=>{
            reject(err.message);
        })        
    });
});

appointmentsSchema.static('getById', (id:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
          return reject(new TypeError('Id is not a valid string.'));
        } 
        let IDUser = userId.toString();
        let _query = {"_id": id};
        Appointments.getAppointment(_query).then(res => {
          _.each(res, function(result) {
            if (result.landlord._id == IDUser || result.tenant._id == IDUser) {
              resolve(result);
            }
            else {
              reject({message:"forbidden"});
            } 
          }) 
        })
        .catch((err)=>{
            reject(err.message);
        }) 
    });
});

appointmentsSchema.static('createAppointments', (appointments:Object, tenant:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      let tenantId = tenant.toString();
      let body:any = appointments;      
      Properties
        .findById(body.property)
        .populate("owner.user development")
        .exec((err, property) => {
          if (err) {
            reject({message: err.message});
          }
          else if (property) {
            let landlordId = property.owner.user._id;
            let propertyId = property._id;
            let data = {
              "property": body.property
            };
            if (landlordId == tenantId) {
              resolve({message: "You can not create appointment with your owned property"});
            }
            else if (landlordId != tenantId) {
              Agreements.createAgreements(data, tenant).then(res => {
                let agreementId = res._id;
                let roomId;
                if (res.room) {
                  roomId = res.room;
                }                
                for(var i = 0; i < body.time.length; i++) {
                  let timeFrom = body.time[i];
                  let timeTo = body.time2[i];
                  Appointments
                    .find({"chosen_time.date": body.date, "chosen_time.from": timeFrom, "chosen_time.to": timeTo})
                    .exec((err, res) => {
                      if (err) {
                        reject(err);
                      }
                      else if (res) {
                        if (res.length == 0) {
                          var _appointments = new Appointments(appointments);
                          _appointments.agreement = agreementId;
                          _appointments.landlord = landlordId;
                          if (roomId) {
                            _appointments.room = roomId;
                          }
                          _appointments.tenant = tenantId;
                          _appointments.chosen_time.date = body.date;
                          _appointments.chosen_time.from = timeFrom;
                          _appointments.chosen_time.to = timeTo;
                          _appointments.save((err, saved)=>{
                            if (err) {
                              reject({message: err.message});
                            }
                            else if (saved) {
                              let appointmentId = saved._id;
                              let roomChatId;
                              if (saved.room) {
                                roomChatId = saved.room;
                              }
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
                                  if (err) {
                                    reject({message: err.message})
                                  }
                                  else if (appointment) {
                                    var devID = appointment.property.development;
                                    var unit = '#'+appointment.property.address.floor+'-'+appointment.property.address.unit;                                    
                                    var notification = {
                                      "user": appointment.landlord._id,
                                      "message": "Viewing Received for "+unit+" "+appointment.property.development.name+" at "+appointment.chosen_time.date+" from "+appointment.chosen_time.from+" to "+appointment.chosen_time.to,
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
                                    resolve({appointment_id: appointmentId, room: roomChatId, message: 'appoinment proposed'});
                                  }                                  
                                })                 
                            }
                          })
                        }
                        else if (res.length > 0) {
                          resolve({message: "Already Appointment"})
                        }
                      }
                    })                  
                }
              })
              .catch(err => {
                reject(err);
              });
            }                        
          }
        })     
    });
});

appointmentsSchema.static('updateAppointmentsRoomId', (landlord:string, tenant:string, property:string, room:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Appointments
          .update({"landlord": landlord, "tenant": tenant, "property": property}, {
            $set: {
              "room": room
            }
          }, {multi: true})
          .exec((err, updated) => {
              err ? reject({message: err.message})
                  : resolve(updated);
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
              err ? reject({message: err.message})
                  : resolve({message: "delete success"});
          });
    });
});

appointmentsSchema.static('updateAppointments', (id:string, status:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(status)) {
          return reject(new TypeError('Status is not a valid string.'));
        }
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
          .exec((err, appointment)=> {
            if (err) {
              reject(err);
            }
            else if (appointment) {
              let devID = appointment.property.development;  
              let unit = '#'+appointment.property.address.floor+'-'+appointment.property.address.unit;
              let user = appointment.tenant._id;
              let emailTo = appointment.tenant.email;
              let fullname = appointment.tenant.username;
              let full_address = appointment.property.address.full_address;
              let landlord_username = appointment.landlord.username;
              let from = 'Staysmart';
              let notification = {
                "user": user,
                "message": "Viewing " + status + " for " + appointment.property.development.name,
                "type": "appointment_proposed",
                "ref_id": id
              };
              appointment.status = status;
              Notifications.createNotifications(notification); 
              if (status == 'accepted') {
                mail.confirmAppointment(emailTo, fullname, full_address, landlord_username, from);
              }
              if (status == 'rejected') {
                mail.rejectAppointment(emailTo, fullname, full_address, landlord_username, from);
              }              
              appointment.save((err, saved)=>{
                err ? reject({message: err.message})
                    : resolve(saved);
              })
            }
            else {
              reject({message: "No Data in Appointment"});
            }
          });        
    });
});

let Appointments = mongoose.model('Appointments', appointmentsSchema);

export default Appointments;