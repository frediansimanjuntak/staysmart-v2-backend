// / <reference path="../typings/index.d.ts" />
"use strict";
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV === "production")
    require("newrelic");
var express = require("express");
var os = require("os");
var fs = require("fs");
var https = require("https");
var index_1 = require("./config/environment/index");
var aws_service_1 = require("./global/aws.service");
var global_service_1 = require("./global/global.service");
var routes_conf_1 = require("./config/routes.conf");
var db_conf_1 = require("./config/db.conf");
var index_2 = require("./routes/index");
var PORT = process.env.PORT || 3000;
var app = express();
if (index_1.default.seedDB) {
    require('./config/seed');
}
require('./config/express').default(app);
routes_conf_1.RoutesConfig.init(app);
db_conf_1.DBConfig.init();
global_service_1.GlobalService.init();
global_service_1.GlobalService.initGlobalFunction();
aws_service_1.AWSConfig.init();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});
index_2.Routes.init(app, express.Router());
var opts = {
    key: fs.readFileSync(__dirname + '/../server/cert/server.key'),
    cert: fs.readFileSync(__dirname + '/../server/cert/server.crt')
};
// run using https
https.createServer(opts, app)
    .listen(PORT, function () {
    console.log("up and running @: " + os.hostname() + " on port: " + PORT);
    console.log("enviroment: " + process.env.NODE_ENV);
});
//# sourceMappingURL=server.js.map