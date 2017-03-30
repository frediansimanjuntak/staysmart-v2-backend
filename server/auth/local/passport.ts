var passport = require('passport')
var passportLocal = require('passport-local')
import * as Promise from 'bluebird';

var LocalStrategy = passportLocal.Strategy;

function localAuthenticate(User, username, password, done) {
  User.findOne({ 
    $or: [
      {username: username.toLowerCase()}, 
      {email: username.toLowerCase()}
    ]
  }).exec()
    .then(user => {
      if(!user) {
        return done(null, false, {
          message: 'Incorrect username/email and password.'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if(authError) {
          return done(authError);
        }
        if(!authenticated) {
          return done(null, false, { message: 'Incorrect username/email and password.' });
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
    
    return localAuthenticate(User, username, password, done);
  }));
}