'use strict';
import * as express from 'express';
import * as mongoose from 'mongoose';
import config from '../config/environment/index';
import User from '../api/v2/users/dao/users-dao';
var passport = require('passport')

// console.log(User);
// Passport Configuration
require('./local/passport').setup(User, config);
require('./facebook/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local').default)
router.use('/facebook', require('./facebook').default);

export default router;
