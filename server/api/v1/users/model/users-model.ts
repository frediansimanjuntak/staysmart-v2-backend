"use strict";

import * as express from 'express';
import * as mongoose from 'mongoose';

var crypto = require('crypto')

var Schema = mongoose.Schema;

var UsersSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true, required: true, trim: true},
	email: {type: String, lowercase: true, unique: true, required: true, trim: true},
	password: {type: String, required: true},  
	salt: {type: String}, 
	phone:{type: String, trim: true},
	role: {type: String, enum: ['user','admin'], default: 'user'},
	verification: {
		verified: {type: Boolean, default: false},
		verified_date: {type: Date},
		expires: {type: Date},
		code: {type: String}
	},
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
			date: {type: Date, default: Date.now},
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
			company: 
			{
				type: Schema.Types.ObjectId,
				ref: 'Companies'
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
			date: {type: Date, default: Date.now},
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
	agreements: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Agreements'
		}
	],
	dreamtalk:
	[{
		loginToken: {type: String},
		loginTokenExpires: {type: Date}
	}],
	companies: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Companies'
		}
	],
	created_at: {type: Date, default: Date.now}
});

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

		// Make salt with a callback
		this.makeSalt((saltErr, salt) => {
			if(saltErr) {
				return next(saltErr);
			}
			this.salt = salt;
			this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
				if(encryptErr) {
					return next(encryptErr);
				}
				this.password = hashedPassword;
				return next();
			});
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

		this.encryptPassword(password, (err, pwdGen) => {
			if(err) {
				return callback(err);
			}

			if(this.password === pwdGen) {
				return callback(null, true);
			} else {
				return callback(null, false);
			}
		});
	},

	/**
	* Make salt
	*
	* @param {Number} [byteSize] - Optional salt byte size, default to 16
	* @param {Function} callback
	* @return {String}
	* @api public
	*/
	makeSalt(byteSize, callback) {
		var defaultByteSize = 16;

		if(typeof arguments[0] === 'function') {
			callback = arguments[0];
			byteSize = defaultByteSize;
		} else if(typeof arguments[1] === 'function') {
			callback = arguments[1];
		} else {
			throw new Error('Missing Callback');
		}

		if(!byteSize) {
			byteSize = defaultByteSize;
		}

		return crypto.randomBytes(byteSize, (err, salt) => {
			if(err) {
				return callback(err);
			} else {
				return callback(null, salt.toString('base64'));
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
		if(!password || !this.salt) {
			if(!callback) {
				return null;
			} else {
				return callback('Missing password or salt');
			}
		}

		var defaultIterations = 10000;
		var defaultKeyLength = 64;
		var salt = new Buffer(this.salt, 'base64');

		if(!callback) {
			return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength)
			.toString('base64');
		}

		return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, (err, key) => {
			if(err) {
				return callback(err);
			} else {
				return callback(null, key.toString('base64'));
			}
		});
	}
};

export default UsersSchema;