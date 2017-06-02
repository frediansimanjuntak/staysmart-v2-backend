'use strict';

import * as express from 'express';
var passport = require('passport')
import {signToken} from '../auth-service';
import Attachments from '../../api/v2/attachments/dao/attachments-dao';
var router = express.Router();

router.post('/', function(req, res, next) {
  
  passport.authenticate('local.normal', function(err, user, info) {
    var error = err || info;
    if(error) {
      if(error.message == "Missing credentials"){
        return res.status(401).json({message: "Incomplete Data Username/Password to logged in", code: 413});
      }      
      else{
        return res.status(401).json(error);
      }      
    }
    if(!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.', code: 404});
    }
    if(user._id && user.role && user.username) {
      var token = signToken(user._id, user.role, user.username);
      if (user.picture) {
        Attachments.getById(user.picture).then(result => {
          res.json({ 
            token: token,
            'x-auth-token': token,
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
          _id: user._id,
          profil : user.nutchat,
          username: user.username,
          email: user.email,
          roles: user.role,
          verified: user.verification.verified,
        });
      }
    }
    else{
      res.json({message: 'please login first.'});
    }
  })(req, res, next);
});

export default router;