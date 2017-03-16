var passport = require('passport')
var passportLocal = require('passport-local')
import * as Promise from 'bluebird';

var FacebookStrategy = passportLocal.Strategy;

function facebookAuthenticate(User, id, accessToken, done) {
  return new Promise((resolve:Function, reject:Function) => {
    User.findOne({
    "service.facebook.id": id
    }, (err, user) => {
      if(user == null) {
        var _new_user = new User();
            _new_user.service.facebook.id = id;
            _new_user.service.facebook.token = accessToken;
            _new_user.save((err, saved)=>{
                  err ? reject(err)
                    : resolve(saved);
                });
        var userId = _new_user._id;
        User
          .findById(userId, (err, userData) => {
            if(err) {
              return done(null, false, {
                message: 'Something went wrong, please try again.'
              });
            }
            return done(null, userData);    
          })
      }
      else{
        return done(null, user);
      }
    })  
  })
}

export function setup(User/*, config*/) {
  passport.use('local.facebook', new FacebookStrategy({
    usernameField: 'id',
    passwordField: 'accessToken',
    passReqToCallback: true
  }, function(req, id, accessToken, done) {
    
    return facebookAuthenticate(User, id, accessToken, done);
  }));
}