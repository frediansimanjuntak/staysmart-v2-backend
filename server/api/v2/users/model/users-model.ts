"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var sha256 = require('sha256');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var UsersSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true, trim: true},
	email: {type: String, lowercase: true, unique: true, trim: true},
	password: {type: String},
	phone:{type: String, trim: true},
	role: {type: String, enum: ['user','admin'], default: 'user'},
	picture: {
		type: Schema.Types.ObjectId,
		ref: 'Attachments'	
	},
	verification: {
		verified: {type: Boolean, default: false},
		verified_date: {type: Date},
		expires: {type: Date},
		code: {type: String}
	},
  reported: {type: Boolean, default: false},
	tenant: {
		data: {
			name: {type: String},
			identification_type: {type: String},
			identification_number: {type: String},
			identification_proof: {
        front: {
          type: Schema.Types.ObjectId,
          ref: 'Attachments'
        },
        back: {
          type: Schema.Types.ObjectId,
          ref: 'Attachments'
        }
      },
			bank_account: {
        bank:
        {
          type: Schema.Types.ObjectId,
          ref: 'Banks'
        },
        name: {type: String},
        no: {type: Number}
      }
		},
		histories: 
		[{
			date: {type: Date},
			data: {}
		}]
	},
	landlord: {
		data: {
			name: {type: String},
			identification_type: {type: String},
			identification_number: {type: String},
			identification_proof: {
				front: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				},
				back: {
					type: Schema.Types.ObjectId,
					ref: 'Attachments'
				}
			},
      owners: [
        {
          name: {type: String},
          identification_type: {type: String},
          identification_number: {type: String},
          identification_proof: 
          {
            front: {
              type: Schema.Types.ObjectId,
              ref: 'Attachments'
            },
            back: {
              type: Schema.Types.ObjectId,
              ref: 'Attachments'
            }
          }
        }
      ],
			bank_account: {
				bank: 
				{
					type: Schema.Types.ObjectId,
					ref: 'Banks'
				},
				name: {type: String},
				no: {type: Number}
			}
		},
		histories: 
		[{
			date: {type: Date},
			data: {}
		}]
	},
	owned_properties: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Properties'
		}
	],
	rented_properties: 
	[{
		until: {type: Date},
		property: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Properties'
		},
		agreement: 
		{
			type: Schema.Types.ObjectId,
			ref: 'Agreements'
		},
	}],
  managed_properties:
  [
    {
      type: Schema.Types.ObjectId,
      ref: 'Properties'
    }
  ],
  chat_rooms: 
  [{
    type: Schema.Types.ObjectId,
    ref: 'ChatRooms'
  }],
	dreamtalk:
	[{
    loginId: {type: String},
		loginToken: {type: String},
		loginTokenExpires: {type: Date}
	}],
  blocked_users: 
  [
    {
      type: Schema.Types.ObjectId,
      ref: 'Users'
    }
  ],  
	companies: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Companies'
		}
	],
  shortlisted_properties :[{
      type: Schema.Types.ObjectId,
      ref: 'Properties'
  }],
  service: {
    facebook: {
      id: {type: String},
      token: {type: String}
    }
  },
  reset_password: {
    token: {type: String},
    created_at: {type: Date},
    expired_at: {type: Date}
  },
	created_at: {type: Date, default: Date.now}
});

// Public profile information
UsersSchema
  .virtual('profile')
  .get(function() {
    return {
      name: this.name,
      role: this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UsersSchema
  .virtual('token')
  .get(function() {
    return {
      _id: this._id,
      role: this.role
    };
  });


/**
 * Validations
 */

// Validate empty email
UsersSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UsersSchema
  .path('password')
  .validate(function(password) {
    return password.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UsersSchema
  .path('email')
  .validate(function(value, respond) {
    return this.constructor.findOne({ email: value }).exec()
      .then(user => {
        if(user) {
          if(this.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

UsersSchema
  .path('username')
  .validate(function(value, respond) {
    return this.constructor.findOne({ username: value }).exec()
      .then(user => {
        if(user) {
          if(this.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified username is already in use.');

UsersSchema
  .path('phone')
  .validate(function(value, respond) {
    return this.constructor.findOne({ phone: value }).exec()
      .then(user => {
        if(user) {
          if(this.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified phone number is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UsersSchema
  .pre('save', function(next) {
    // Handle new/update passwords
    if(!this.isModified('password')) {
      return next();
    }

    if(!validatePresenceOf(this.password)) {
      return next(new Error('Invalid password'));
    }
    this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
      if(encryptErr) {
        return next(encryptErr);
      }
      this.password = hashedPassword;
      return next();
    });

  });

/**
 * Methods
 */
UsersSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if(!callback) {
      return this.password === this.encryptPassword(password);
    }

    bcrypt.compare(sha256(password), this.password, function(err, res) {
        if(res) {
          return callback(null, true);
        }
        else{
          return callback(null, false);
        }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if(!password) {
      if(!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    if(!callback) {
      bcrypt.hash(sha256(password), 10, function(err, hash){
        return hash;
      });
    }
    else{
      bcrypt.hash(sha256(password), 10, function(err, hash){
        if(err) {
          return callback(err);
        } else {
          return callback(null, hash);
        }
      });
    }
  }
};

export default UsersSchema;