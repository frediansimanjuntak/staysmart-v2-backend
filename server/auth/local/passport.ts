var passport = require('passport')
var passportLocal = require('passport-local')
import * as Promise from 'bluebird';

var LocalStrategy = passportLocal.Strategy;

function facebookAuthenticate(User, username, password, done) {
  User.findOne({
    username: username.toLowerCase()
  }).exec()
    .then(user => {
      if(!user) {
        return done(null, false, {
          message: 'This username is not registered.'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if(authError) {
          return done(authError);
        }
        if(!authenticated) {
          return done(null, false, { message: 'This password is not correct.' });
        } else {
          return done(null, user);
        }
      });
    })
 
    .catch(err => done(err));
}

export function setup(User/*, config*/) {
  passport.use('local.normal', new LocalStrategy({
    usernameField: 'username',
    passReqToCallback: true
  }, function(req, username, password, done) {
    
    return facebookAuthenticate(User, username, password, done);
  }));
}