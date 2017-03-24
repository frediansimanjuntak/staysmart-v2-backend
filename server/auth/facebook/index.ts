'use strict';

import * as express from 'express';
var passport = require('passport')
import {signToken} from '../auth-service';

var router = express.Router();

router.post('/', function(req, res, next) {
  
  passport.authenticate('local.facebook', function(err, user, info) {
    var error = err || info;
    if(error) {
      return res.status(401).json(error);
    }
    if(!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }
    if(!user.username){
      var data = false;
    }
    else{
      data = true;
    }
    if(user._id && user.role && user.service.facebook.id) {
      var token = signToken(user._id, user.role, user.service.facebook.id);
      res.json({ token, userId: user._id, data});
    }
    else{
      res.json({message: 'please login first.'});
    }
  })(req, res, next);
});

export default router;