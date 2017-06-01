'use strict';

import * as express from 'express';
var passport = require('passport')
import {signToken} from '../auth-service';
import Attachments from '../../api/v2/attachments/dao/attachments-dao';

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
      if (user.picture) {
        Attachments.getById(user.picture).then(result => {
          res.json({ 
            token: token,
            _id: user._id,
            profil : user.nutchat,
            username: user.username,
            email: user.email,
            roles: user.role,
            verified: user.verification.verified,
            picture: result.url
          });
        });
      }
      else {
        res.json({ 
          token: token, 
          'x-auth-token': token,
          userId: user._id, 
          data: data,
          authorization: token,
          _id: user._id,
          email: user.email,
          roles: user.role,
          verified: user.verification.verified
        });
      }
    }
    else{
      res.json({message: 'please login first.'});
    }
  })(req, res, next);
});

export default router;