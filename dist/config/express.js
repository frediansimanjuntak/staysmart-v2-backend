/**
 * Express configuration
 */
'use strict';
var express = require("express");
var favicon = require("serve-favicon");
var morgan = require("morgan");
// import * as shrinkRay from 'shrink-ray';
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var cookieParser = require("cookie-parser");
var errorHandler = require("errorhandler");
var path = require("path");
var environment_1 = require("./environment");
var passport = require('passport');
var session = require("express-session");
var connectMongo = require("connect-mongo");
var mongoose = require("mongoose");
var MongoStore = connectMongo(session);
function default_1(app) {
    var env = app.get('env');
    if (env === 'development' || env === 'test') {
        app.use(express.static(path.join(environment_1.default.root, '.tmp')));
    }
    if (env === 'production') {
        app.use(favicon(path.join(environment_1.default.root, 'client', 'favicon.ico')));
    }
    app.set('appPath', path.join(environment_1.default.root, 'client'));
    app.use(express.static(app.get('appPath')));
    app.use(morgan('dev'));
    app.set('views', environment_1.default.root + "/server/views");
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    // app.use(shrinkRay());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(passport.initialize());
    // Persist sessions with MongoStore / sequelizeStore
    // We need to enable sessions for passport-twitter because it's an
    // oauth 1.0 strategy, and Lusca depends on sessions
    app.use(session({
        secret: environment_1.default.secrets.session,
        saveUninitialized: true,
        resave: false,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            db: 'staysmart-revamp'
        })
    }));
    if (env === 'development' || env === 'test') {
        app.use(errorHandler()); // Error handler - has to be last
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//# sourceMappingURL=express.js.map