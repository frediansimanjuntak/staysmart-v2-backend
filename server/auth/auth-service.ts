'use strict';
import config from '../config/environment/index';
import * as jwt from 'jsonwebtoken';
// import * as expressJwt from 'express-jwt';
var expressJwt = require('express-jwt')
import * as compose from 'composable-middleware';
import User from '../api/v2/users/dao/users-dao';
import Attachment from '../api/v2/attachments/dao/attachments-dao';
// import * as jwtDecode from 'jwt-decode';
var jwtDecode = require('jwt-decode');

var validateJwt = expressJwt({
  secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
export function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = `Bearer ${req.query.access_token}`;
        req.headers['x-auth-token'] = `Bearer ${req.query.access_token}`;
      }
     // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
      if(req.query && typeof req.headers.authorization === 'undefined') {
        if (req.headers['x-auth-token']) {
          req.headers.authorization = `Bearer ${req.headers['x-auth-token']}`;
        }
        else {
          req.headers.authorization = `Bearer ${req.cookies.token}`;  
        }
      }
     
      validateJwt(req, res, function(err, validate){
        if(err) {
          if(err.message == "jwt expired"){
            if (req.device.type == 'desktop') {
              return res.status(err.status).send({message: "Your session has been expired", code: 411});
            }
            else {
              let decodeToken = jwtDecode(req.headers['x-auth-token']);
              let newToken = signToken(decodeToken._id, decodeToken.role, decodeToken.username);
              req.headers['x-auth-token'] = newToken;
              req.headers.authorization = `Bearer ${newToken}`;
              validateJwt(req, res, next);
            }
          }
          else if(err.message == "jwt malformed"){
            return res.status(err.status).send({message: "You must be logged in to do this", code: 412});
          }
          else{
            return res.status(err.status).send({message: err.message});
          }
        }
        else{
          validateJwt(req, res, next);
        }
      });
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findById(req.user._id).select('+blacklisted_token.token').exec((err, user) => {
        if (err) {
          next({message: "error", err});
        }
        else {
          if(!user) {
            return res.status(401).end();
          }
          if (user) { 
            if (user.blacklisted_token.length > 0) {
              let tokenBlacklist;
              for (var i = 0; i < user.blacklisted_token.length; i++) {
                let blacklist = user.blacklisted_token[i];
                let token = blacklist.token;
                if (token == req.headers.authorization) {
                  tokenBlacklist = true;
                }
              }
              if (tokenBlacklist == true) {
                return res.status(412).send({message: "You must be logged in to do this", code: 412});
              }
              else {
                if(user.picture) {
                  Attachment.findById(user.picture).exec((err, picture) => {
                    user.picture = picture.url;
                    req.user = user;
                    next();
                  });
                }
                else {
                  req.user = user;
                  next();
                }
              }
            }
            else {
              if(user.picture) {
                Attachment.findById(user.picture).exec((err, picture) => {
                  user.picture = picture.url;
                  req.user = user;
                  next();
                });
              }
              else {
                req.user = user;
                next();
              }
            }            
          }
        }          
      })
    });
}


/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function hasRole(roleRequired) {
  if(!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if(config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        return next();
      } else {
        return res.status(403).send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(id, role, username) {
  return jwt.sign({ _id: id, role, username }, config.secrets.session, {
    expiresIn: 60 * 60 * 5
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
export function setTokenCookie(req, res) {
  if(!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  var token = signToken(req.user._id, req.user.role, req.user.username);
  res.cookie('token', token);
  res.redirect('/');
}
