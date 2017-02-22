// / <reference path="../typings/index.d.ts" />

"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === "production")
    require("newrelic");

import * as express from "express";
import * as os from "os";
import * as fs from 'fs';
import * as http from "http";
import * as https from "https";
import config from './config/environment/index';
import {GlobalService} from './global/global.service';
import {RoutesConfig} from "./config/routes.conf";
import {DBConfig} from "./config/db.conf";
import {Routes} from "./routes/index";

var PORT = process.env.PORT || 3000;
const app = express();

// if(config.seedDB) { require('./config/seed'); }

require('./config/express').default(app);
RoutesConfig.init(app);
DBConfig.init();
GlobalService.init();
GlobalService.initGlobalFunction();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
  next()
})

Routes.init(app, express.Router());


const opts = {
  key: fs.readFileSync(__dirname + '/../server/cert/server.key'),
  cert: fs.readFileSync(__dirname + '/../server/cert/server.crt')
}

// run using https
https.createServer(opts, app)
     .listen(PORT, () => {
       console.log(`up and running @: ${os.hostname()} on port: ${PORT}`);
       console.log(`enviroment: ${process.env.NODE_ENV}`);
     });