import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as moment from 'moment';
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
                reject({message: err.message, code: 400});
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
        let _query = {"property": idproperty, };
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
              reject({message:"forbidden", code: 400});
            } 
          }) 
        })
        .catch((err)=>{
            reject({message: err.message, code: 400});
        }) 
    });
});

appointmentsSchema.static('readAppointment', (id:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Appointments.findById(id).exec((err, res) => {
          let type;
          if (res.tenant == userId) {
            type = 'tenant';
            res.tenant_read = true;
          }
          else if (res.landlord == userId) {
            type = 'landlord';
            res.landlord_read = true;
          }
          else {
            reject({message: 'You not a member of this appointment.', code: 400});
          }
          res.save((err, saved) => {
            err ? reject({message: err.message, code: 400})
                : resolve({
                  message: 'success',
                  code: 200,
                  data: [1]
                });
          })
        })
    });
});

appointmentsSchema.static('initiateLOICheck', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      Appointments.findById(id).exec((err, res) => {
        let initiated;
        if (res.state != 'under consideration') {
          initiated = true;
        }
        else {
          initiated = false;
        }
        resolve({
          message: 'success',
          code: 200,
          data: { initiated: initiated }
        });
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
            reject({message: err.message, code: 400});
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
                    .find({"property": body.property, "chosen_time.date": body.date, "chosen_time.from": timeFrom, "chosen_time.to": timeTo, "status": {$nin: ["rejected", "cancel"]}})
                    .exec((err, res) => {
                      if (err) {
                        reject({message: err.message, code: 400});
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
                              reject({message: err.message, code: 400});
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
                                    reject({message: err.message, code: 400})
                                  }
                                  else if (appointment) {
                                    var devID = appointment.property.development;
                                    var unit = '#'+appointment.property.address.floor+'-'+appointment.property.address.unit;                                    
                                    var notification = {
                                      "user": appointment.landlord._id,
                                      "message": "Viewing Received for "+appointment.property.development.name,
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
                reject({message: err.message, code: 400});
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
              err ? reject({message: err.message, code: 400})
                  : resolve(updated);
          });
    });
});

appointmentsSchema.static('memberSectionAppointment', (type:string, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      let exist_type = ["proposed", "upcoming", "archived"];
      if (exist_type.indexOf(type) > -1) {
        let _query;
        if (type == 'upcoming') {
          _query = {$or:[{"tenant": userId}, {"landlord": userId}], "status": "accepted"}; 
        }
        else if (type == 'archived') {
          _query = {"status": "archived", $or:[{"tenant": userId}, {"landlord": userId}]}; 
        }
        else {
          _query = {$or:[{"tenant": userId}, {"landlord": userId}], "status": {$in: [ "cancel", "pending", "rejected"]}}; 
        }
        Appointments
          .find(_query)
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
            },{
              path: 'owner.user',
              model: 'Users'
            }]
          })
          .exec((err, appointments) => {
              if (err) { reject({message: err.message, code: 400}); }
              else if (appointments){
                let landlordUnread = 0;
                let tenantUnread = 0;
                let totalAppointmentLandlord = 0;
                let totalAppointmentTenant = 0;
                let readBy = [];
                for (var a = 0; a < appointments.length; a++) {
                  let appointment = appointments[a];
                  if (appointment.tenant) {
                    let tenant = appointment.tenant;
                    if (tenant._id == userId.toString()){
                      totalAppointmentTenant = totalAppointmentTenant + 1;
                      if (appointment.tenant_read == false) {
                        tenantUnread = tenantUnread + 1;
                      }
                      else if (appointment.tenant_read == true) {
                        readBy.push(tenant._id);
                      }
                    }                    
                  }                  
                  let landlord = appointment.landlord;
                  if (landlord._id == userId.toString()) {
                    totalAppointmentLandlord = totalAppointmentLandlord + 1;
                    if (appointment.landlord_read == false) {
                      landlordUnread = landlordUnread + 1;
                    }
                    else if (appointment.landlord_read == true) {
                      readBy.push(landlord._id);
                    }
                  }                  
                }
                let datas = [];
                for (var i = 0; i < appointments.length; i++) {
                  let appointment = appointments[i];
                  let appointmentId = appointment._id;                                  
                  let landlord = appointment.landlord;
                  let landlordPic = "";
                  let scheduleTime;
                  let idSchedule = "";
                  let timeFromSchedule = "";
                  let timeToSchedule = "";
                  let tenantPic = "";                  
                  let read = false;
                  let unread  = 0;
                  let statusOwn  = "";
                  let tenant;
                  let unit = "";
                  let unit2 = "";
                  let blok = "";
                  let streetName = "";
                  let postalCode = "";
                  let fullAddress = "";
                  let country = "";
                  let typeProp = "";
                  let coordinates = [];
                  let tenantUsername  = "";
                  let pictureProp = [];
                  let idProperties  = "";
                  let DevelopmentName  = "";
                  let totalAppointment  = 0;
                  let message = "";
                  let detailsSize = 0;
                  let detailsSizeSqm = 0;
                  let detailsBedroom = 0;
                  let detailsBathrom = 0;
                  let detailsPrice = 0;
                  let detailsPsqft = 0;
                  let detailsAvailable = "";
                  let detailsFurnishing = "";
                  let detailsDescription = "";
                  let detailsType = "";
                  if (appointment.message) {
                    message = appointment.message;
                  }
                  if (appointment.tenant) {
                    tenant = appointment.tenant;
                    tenantUsername = tenant.username;
                    if (tenant.picture) {
                      tenantPic = tenant.picture.url;
                    }
                    if (tenant._id == userId.toString()){
                      read = appointment.tenant_read;
                      unread = tenantUnread; 
                      statusOwn = "tenant";
                      totalAppointment = totalAppointmentTenant;
                    }
                  }
                  if (appointment.property) {
                    let property = appointment.property;
                    let scheduleId = appointment.schedule; 
                    idProperties = property._id;
                    DevelopmentName = property.development.name;
                    unit = property.address.floor;
                    unit2 = property.address.unit;
                    blok = property.address.block_number;
                    postalCode = property.address.postal_code.toString();                    
                    streetName = property.address.street_name;
                    fullAddress = property.address.full_address,
                    country = property.address.country;
                    typeProp = property.address.type;
                    coordinates =  [Number(property.address.coordinates[0]) , Number(property.address.coordinates[1])];
                    for (var j = 0; j < property.schedules.length; j++){
                      let schedule = property.schedules[j];
                      let idSchedule = schedule._id.toString();
                      if (idSchedule == scheduleId) {
                        scheduleTime = schedule;
                      }
                    }
                    if (property.pictures.living.length > 0) {
                      for (var k = 0; k < property.pictures.living.length; k++) {
                        let pictureLiving = property.pictures.living[k].url;
                        pictureProp.push(pictureLiving);
                      }
                    }
                    detailsSize = property.details.size_sqf;
                    detailsSizeSqm = property.details.size_sqm;	
                    detailsBedroom = property.details.bedroom;
                    detailsBathrom = property.details.bathroom;				
                    detailsPrice = property.details.price;
                    detailsPsqft = property.details.psqft;
                    detailsAvailable = property.details.available;
                    detailsFurnishing = property.details.furnishing;
                    detailsDescription = property.details.description;
                    detailsType = property.details.type;                    
                  }      
                  if (scheduleTime) {
                    idSchedule = scheduleTime._id;
                    timeFromSchedule = scheduleTime.time_from;
                    timeToSchedule =  scheduleTime.time_to;
                  }
                  if (landlord.picture) {
                    landlordPic = landlord.picture.url;
                  }                  
                  if (landlord._id == userId.toString()) {
                    read = appointment.landlord_read;
                    unread = landlordUnread;
                    statusOwn = "landlord";
                    totalAppointment = totalAppointmentLandlord;
                  }
                  let dateChoosenTime = "";
                  let timeChoosenTime = "";
                  let time2ChoosenTime = "";
                  if (appointment.chosen_time) {
                    dateChoosenTime = moment(appointment.chosen_time.date, 'dddd, DD-MM-YYYY').format('YYYY-MM-DD');
                    timeChoosenTime = appointment.chosen_time.from;
                    time2ChoosenTime = appointment.chosen_time.to;
                  }
                  let data = {
                    "_id": appointment._id,
                    "landlord": {
                      "username": landlord.username,
                      "pictures": landlordPic
                    },
                    "tenant": {
                      "username": tenantUsername,
                      "pictures": tenantPic
                    },
                    "schedule": {
                      "schedule_id": idSchedule,
                      "date": dateChoosenTime,
                      "time": timeChoosenTime,
                      "time2": time2ChoosenTime,
                      "time_from": timeFromSchedule,
                      "time_to": timeToSchedule
                    },
                    "property": {
                      "_id": idProperties,
                      "development": DevelopmentName,
                      "user": {
                        "_id": landlord._id,
                        "username": landlord.username,
                        "pictures": landlordPic
                      },
                      "address": {
                        "unit_no": unit,
                        "unit_no_2": unit2,
                        "block_no": blok,
                        "street_name": streetName,
                        "postal_code": postalCode,
                        "full_address": fullAddress,
                        "country": country,
                        "type": typeProp,
                        "coordinates": coordinates
                      },
                      "details": {
                        "size": detailsSize,
                        "size_sqm": detailsSizeSqm,
                        "bedroom": detailsBedroom,
                        "bathroom": detailsBathrom,
                        "price": detailsPrice,
                        "psqft": detailsPsqft,
                        "available": detailsAvailable,
                        "furnishing": detailsFurnishing,
                        "description": detailsDescription,
                        "type": detailsType
                      },
                      "pictures": pictureProp
                    },
                    "status": appointment.status,
                    "read_by": readBy,
                    // "message": message,
                    "created_at": appointment.created_at,
                    "state": appointment.state,
                    "status_own": statusOwn,
                    "read": read,
                    "unread": unread,
                    "total": totalAppointment
                  }
                  datas.push(data);
                }
                resolve(datas);
              }
          });
      }
      else {
        reject({message: 'Invalid type', code: 400});
      }
    });
});

appointmentsSchema.static('memberSectionAction', (type:string, data:Object, userId:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let body:any = data;
        Appointments 
          .findById(body.appointment)
          .exec((err, appointment) => {
            if (err) { reject({message: err.message, code: 400}); }
            else if (appointment) {
              let landlord = appointment.landlord;
              let tenant = appointment.tenant;
              let status;
              if (landlord == userId.toString() || tenant == userId.toString()) {
                if (type == 'proposed') {
                  if (body.action == 'cancel' || body.action == 'accepted' || body.action == 'rejected') {
                    status = body.action;
                  }
                  else { reject({message: "Can not to do this action", code: 400}); }
                }
                else if (type == 'upcoming'){
                  if (body.action == 'archived') { status = body.action; }
                  else { reject({message: "Can not to do this action", code: 400}); }
                }
                else if (type == 'archived'){
                  if (body.action == 'rejected') { status = body.action; }
                  else { reject({message: "Can not to do this action", code: 400}); }
                }
                Appointments.updateAppointments(body.appointment, status).then((res) => {
                  if (!res.code || res.code != 400) {
                    Appointments
                      .findById(body.appointment)
                      .populate([{
                        path: 'property',
                        model: 'Properties',
                        populate: [{
                          path: 'development',
                          model: 'Developments'
                        },
                        {
                          path: 'owner.user',
                          model: 'Users',
                          populate: {
                            path: 'picture',
                            model: 'Attachments'
                          }
                        }, {
                          path: 'pictures.living',
                          model: 'Attachments'
                        }, {
                          path: 'pictures.dining',
                          model: 'Attachments'
                        }, {
                          path: 'pictures.bed',
                          model: 'Attachments'
                        }, {
                          path: 'pictures.toilet',
                          model: 'Attachments'
                        }, {
                          path: 'pictures.kitchen',
                          model: 'Attachments'
                        }]
                      }, 
                      {
                        path: 'tenant',
                        model: 'Users',
                        populate: {
                          path: 'picture',
                          model: 'Attachments'
                        }
                      },
                      {
                        path: 'landlord',
                        model: 'Users',
                        populate: {
                          path: 'picture',
                          model: 'Attachments'
                        }
                      }])
                      .exec((err, appointments) => {
                        if (err) { reject({message: err.message, code: 400}); }
                        else if (appointments) {
                          let scheduleId = "";
                          let scheduleTime;
                          let idSchedule = "";
                          let timeFromSchedule = "";
                          let timeToSchedule = "";
                          let readBy = [];
                          let property = appointments.property;
                          let message = "";
                          let createdAt = ""
                          if (appointments.created_at) {
                            createdAt = appointments.created_at;
                          }
                          if (appointment.message) {
                            message = appointment.message;
                          }
                          for (var j = 0; j < property.schedules.length; j++){
                            let schedule = property.schedules[j];
                            let idSchedule = schedule._id.toString();
                            if (idSchedule == scheduleId) {
                              scheduleTime = schedule;
                            }
                          }
                          if (scheduleTime) {
                            idSchedule = scheduleTime._id;
                            timeFromSchedule = scheduleTime.time_from;
                            timeToSchedule =  scheduleTime.time_to;
                          }
                          if (appointments.tenant_read == true) {
                            readBy.push(tenant);
                          }
                          else if (appointments.landlord_read == true) {
                            readBy.push(landlord);
                          }
                          let pictures = [];
                          for (var l = 0; l < appointments.property.pictures.living.length; l++) {
                            pictures.push(appointments.property.pictures.living[l].url);
                          }

                          for (var d = 0; d < appointments.property.pictures.dining.length; d++) {
                            pictures.push(appointments.property.pictures.dining[d].url);
                          }

                          for (var b = 0; b < appointments.property.pictures.bed.length; b++) {
                            pictures.push(appointments.property.pictures.bed[b].url);
                          }

                          for (var t = 0; t < appointments.property.pictures.toilet.length; t++) {
                            pictures.push(appointments.property.pictures.toilet[t].url);
                          }

                          for (var k = 0; k < appointments.property.pictures.kitchen.length; k++) {
                            pictures.push(appointments.property.pictures.kitchen[k].url);
                          }
                          let own;
                          userId == appointments.landlord._id ? own = 'landlord' : own = 'tenant';

                          let data = {
                            "_id": appointments._id,
                            "landlord": {
                              "username": appointments.landlord.username,
                              "pictures": appointments.landlord.picture ? appointments.landlord.picture.url : appointments.landlord.service ? appointments.landlord.service.facebook ? appointments.landlord.service.facebook.picture ? appointments.landlord.service.facebook.picture : '' : '' : ''
                            },
                            "tenant": {
                              "username": appointments.tenant.username,
                              "pictures": appointments.tenant.picture ? appointments.tenant.picture.url : appointments.tenant.service ? appointments.tenant.service.facebook ? appointments.tenant.service.facebook.picture ? appointments.tenant.service.facebook.picture : '' : '' : ''
                            },
                            "schedule": {
                              "schedule_id": idSchedule,
                              "date": appointments.chosen_time.date,
                              "time": appointments.chosen_time.from,
                              "time2": appointments.chosen_time.to,
                              "time_from": timeFromSchedule,
                              "time_to": timeToSchedule
                            },
                            "property": {
                              _id: appointments.property._id,
                              development: appointments.property.development.name,
                              user: {
                                _id: appointments.property.owner.user._id,
                                username: appointments.property.owner.user.username,
                                pictures: appointments.property.owner.user.picture ? appointments.property.owner.user.picture.url : appointments.property.owner.user.service ? appointments.property.owner.user.service.facebook ? appointments.property.owner.user.service.facebook.picture ? appointments.property.owner.user.service.facebook.picture : '' : '' : ''
                              },
                              address: {
                                postal_code: String(appointments.property.address.postal_code),
                                unit_no: appointments.property.address.floor,
                                unit_no_2: appointments.property.address.unit,
                                block_no: appointments.property.address.block_number,
                                street_name: appointments.property.address.street_name,
                                country: appointments.property.address.country,
                                full_address: appointments.property.address.full_address,
                                type: appointments.property.address.type,
                                coordinates: [Number(appointments.property.address.coordinates[0]), Number(appointments.property.address.coordinates[1])]
                              },
                              details: {
                                size: appointments.property.details.size_sqf,
                                size_sqm: appointments.property.details.size_sqm,
                                bedroom: appointments.property.details.bedroom,
                                bathroom: appointments.property.details.bathroom,
                                price: appointments.property.details.price,
                                psqft: appointments.property.details.psqft,
                                available: appointments.property.details.available,
                                furnishing: appointments.property.details.furnishing,
                                description: appointments.property.details.description,
                                type: appointments.property.details.type
                              },
                              pictures: pictures
                            },
                            "status": appointments.status,
                            "read_by": readBy,
                            "message": message,
                            "status_own": own,
                            "created_at": createdAt,
                            "state": appointments.state
                          }
                          resolve(data);
                        }
                      })
                  }
                  else { reject(res); }
                })
                .catch((err) => { reject({message: err.message, code: 400}); })
              }
              else { reject({message: "forbidden", code: 400});}
            }
            else { reject({message: "Appointment not found", code: 400}); }
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
              err ? reject({message: err.message, code: 400})
                  : resolve({message: "delete success"});
          });
    });
});

appointmentsSchema.static('updateAppointments', (id:string, status:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
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
              reject({message: err.message, code: 400});
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
                err ? reject({message: err.message, code: 400})
                    : resolve(saved);
              })
            }
            else {
              reject({message: "No Data in Appointment", code: 400});
            }
          });        
    });
});

appointmentsSchema.static('addSchedule', (appointments: Object, tenant: Object, propertyId: string):Promise<any> => {
  return new Promise((resolve:Function, reject:Function) => {
    let body: any = appointments;
    Properties.findById(propertyId).exec((err, properties) => {
      if (err) { reject({message: err.message, code: 400}); }
      else {
        Agreements.createAgreements({"property": propertyId}, tenant).then(res => {
          let agreementId = res._id;
          let roomId;
          if (res.room) {
            roomId = res.room;
          }
          let schedules_id = [];
          for (var i = 0; i < body.schedules.length; i++) {
            let schedules = body.schedules[i];
            let appointment = {
              date: body.date,
              time: [schedules.time],
              time2: [schedules.time2],
              property: propertyId,
              schedule: schedules.schedule_id,
              message: body.message
            };
            let _appointment = new Appointments();
                _appointment.room = roomId;
                _appointment.agreement = agreementId;
                _appointment.landlord = properties.owner.user;
                _appointment.tenant = tenant;
                _appointment.property = propertyId;
                _appointment.schedule = schedules.schedule_id;
                _appointment.chosen_time.date = body.date;
                _appointment.chosen_time.from = schedules.time;
                _appointment.chosen_time.to = schedules.time2;
                _appointment.message = body.message;
                _appointment.save((err, saved) => {
                  if (err) { reject({message: err.message, code: 400}); }
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
                          reject({message: err.message, code: 400})
                        }
                        else if (appointment) {
                          var devID = appointment.property.development;
                          var unit = '#'+appointment.property.address.floor+'-'+appointment.property.address.unit;                                    
                          var notification = {
                            "user": appointment.landlord._id,
                            "message": "Viewing Received for "+appointment.property.development.name,
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
                        }                                  
                      });                 
                  }
                });
                schedules_id.push(_appointment._id);
          }
          resolve({
            message: "success",
            code: 200,
            data: {
              _id: schedules_id
            }
          });
        });
      }
    })
  });
});

let Appointments = mongoose.model('Appointments', appointmentsSchema);

export default Appointments;