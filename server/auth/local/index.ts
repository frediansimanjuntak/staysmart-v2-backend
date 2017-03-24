'use strict';

import * as express from 'express';
var passport = require('passport')
import {signToken} from '../auth-service';

var router = express.Router();

router.post('/', function(req, res, next) {
  
  passport.authenticate('local.normal', function(err, user, info) {
    var error = err || info;
    if(error) {
      return res.status(401).json(error);
    }
    if(!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }
    if(user._id && user.role && user.username) {
      var token = signToken(user._id, user.role, user.username);
      res.json({ token });
    }
    else{
      res.json({message: 'please login first.'});
    }
  })(req, res, next);
});

export default router;