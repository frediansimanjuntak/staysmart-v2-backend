// / <reference path="../typings/index.d.ts" />

"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
import * as express from "express";
import * as device from 'express-device';
import * as os from "os";
import * as fs from 'fs';
import * as http from "http";
import * as https from "https";
import config from './config/environment/index';
import {AWSConfig} from './global/aws.service';
import {DreamTalk} from './global/chat.service';
import {GlobalService} from './global/global.service';
import {RoutesConfig} from "./config/routes.conf";
import {DBConfig} from "./config/db.conf";
import {Routes} from "./routes/index";
import {Cron} from "./cron/index";

var PORT = process.env.PORT || 5000;
const app = express();
app.use(device.capture());

if(config.seedDB) { require('./config/seed'); }

require('./config/express').default(app);
RoutesConfig.init(app);
DBConfig.init();
GlobalService.init();
GlobalService.initGlobalFunction();
AWSConfig.init();
DreamTalk.init();
Cron.init();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control")
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
  next()
})

Routes.init(app, express.Router());


const opts = {
  key: fs.readFileSync(__dirname + '/../server/cert/server.key'),
  cert: fs.readFileSync(__dirname + '/../server/cert/server.crt')
}

var server = https.createServer(opts, app)
var io = require('socket.io')(server);
// var ioo = require('socket.io-client');

export class socketIo{
  static notif(data){
    let body:any = data;    
    let userId = body.user;
    io.on('connect', onConnect);
    function onConnect(socket){
      socket.emit('notification_'+userId, { message: 'You get new notification', type: body.type, referenceId: body.ref_id });
    }
  }
  static counterUser(data){
    let body:any = data;    
    io.on('connect', onConnect);
    function onConnect(socket){
      socket.emit('counter_user', { message: 'You got new user', total_user_today: body.total });
    }
  }
  static counterListing(data){
    let body:any = data;    
    io.on('connect', onConnect);
    function onConnect(socket){
      socket.emit('counter_listing', { message: 'You got new listing', total_listing_today: body.total });
    }
  }
  static counterLOI(data){
    let body:any = data;    
    io.on('connect', onConnect);
    function onConnect(socket){
      socket.emit('counter_loi', { message: 'You got loi need to approved', total_loi: body.total });
    }
  }
  static counterTA(data){
    let body:any = data;    
    io.on('connect', onConnect);
    function onConnect(socket){
      socket.emit('counter_ta', { message: 'You got ta need to approved', total_ta: body.total });
    }
  }
  static counterCertificate(data){
    let body:any = data;    
    io.on('connect', onConnect);
    function onConnect(socket){
      socket.emit('counter_ta', { message: 'You got certificate need to uploaded', total_certificate: body.total });
    }
  }
}
// io.on('connect', onConnect);
// let tes = '123456'
// function onConnect(socket){
//   setInterval(function(){
//       socket.emit('notification_'+tes, { hello: 'world' }); 
//   }, 1000);
// }

// var socket = ioo('https://localhost:5000');
// socket.on('notification_590a9e408eb848305c5a307c', function (data) {
//   console.log("test", data);
// });

// run using https
server.listen(PORT, () => {
       console.log(`up and running @: ${os.hostname()} on port: ${PORT}`);
       console.log(`enviroment: ${process.env.NODE_ENV}`);
     });

// run using http
// http.createServer(app)
//      .listen(PORT, () => {
//        console.log(`up and running @: ${os.hostname()} on port: ${PORT}`);
//        console.log(`enviroment: ${process.env.NODE_ENV}`);
//      });
