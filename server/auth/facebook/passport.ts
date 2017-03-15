var passport = require('passport')
var passportLocal = require('passport-local')
import * as Promise from 'bluebird';

var LocalStrategy = passportLocal.Strategy;

function facebookAuthenticate(User, id, accessToken, done) {
  User.findOne({
    "service.facebook.id": id
  }).exec()
    .then(user => {
      if(!user) {
        return new Promise((resolve:Function, reject:Function) => {
          var _new_user = new User();
              _new_user.service.facebook.id = id;
              _new_user.service.facebook.token = accessToken;
              _new_user.save((err, saved)=>{
                    err ? reject(err)
                      : resolve(saved);
                  });
          var userId = _new_user._id;
          console.log('user id: '+userId);
          User.findById(userId, (err, data) => {
            return done(null, _new_user);
          })
        });
      }
      else{
        console.log('user data exist: '+user);
        return done(null, user);
      }
    })
   
    .catch(err => done(err));
}

export function setup(User/*, config*/) {
  passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'accessToken',
  }, function(id, accessToken, done) {
    
    return facebookAuthenticate(User, id, accessToken, done);
  }));
}