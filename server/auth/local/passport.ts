var passport = require('passport')
var passportLocal = require('passport-local')

var LocalStrategy = passportLocal.Strategy;

function localAuthenticate(User, username, password, done) {
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
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password', // this is the virtual field on the model
  }, function(username, password, done) {
    return localAuthenticate(User, username, password, done);
  }));
}