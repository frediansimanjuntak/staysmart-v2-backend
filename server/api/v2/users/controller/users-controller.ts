import * as express from 'express';
import UsersDAO from '../dao/users-dao';
var passport = require('passport');

export class UsersController {
	static index(req: express.Request, res: express.Response):void {
		UsersDAO
		['index']()
		.then(users => res.status(200).json(users))
		.catch(error => res.status(400).json(error));
	}

	static getAll(req: express.Request, res: express.Response):void {
		UsersDAO
		['getAll']()
		.then(users => res.status(200).json(users))
		.catch(error => res.status(400).json(error));
	}

	static me(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _headers = req.headers;
		let _device = 'phone';
		UsersDAO
		['me'](_userId, _headers, _device)
		.then(users => res.status(200).json(users))
		.catch(error => res.status(400).json(error));
	}

	static username(req: express.Request, res: express.Response):void {
		let _user = req.body;
		UsersDAO
		['username'](_user)
		.then(users => res.status(200).json(users))
		.catch(error => res.status(400).json(error));
	}

	static meData(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _headers = req.headers;
		let _param = req.params.type;
		let _device = req.device.type;
		UsersDAO
		['meData'](_userId, _param, _headers, _device)
		.then(users => res.status(200).json(users))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		UsersDAO
		['getById'](_id)
		.then(users => res.status(200).json(users))
		.catch(error => res.status(400).json(error));
	}

	static createUser(req: express.Request, res: express.Response):void {
		let _user = req.body;

		UsersDAO
		['createUser'](_user)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static searchUser(req: express.Request, res: express.Response):void {
		let _search = req.params.search;

		UsersDAO
		['searchUser'](_search)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static checkUserData(req: express.Request, res: express.Response):void {
		let _search = req.params.search.toLowerCase();
		UsersDAO
		['checkUserData'](_search)
		.then(users => res.status(200).json(users))
		.catch(error => res.status(400).json(error));
	}

	static getPropertyNonManager(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		
		UsersDAO
		['getPropertyNonManager'](_userId)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static signUp(req: express.Request, res: express.Response):void {
		let _user = req.body;
		let _headers = req.headers;
		let _device = req.device.type;
		UsersDAO
		['signUp'](_user, _headers, _device)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static updateMe(req: express.Request, res: express.Response):void {
		let _id = req["user"]._id;
		let _user = req.body;
		let _image = req["files"];
		let _headers = req.headers;
		let _device = req.device.type;
		UsersDAO
		['updateMe'](_id, _user, _image, _headers, _device)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static updateUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _user = req.body;
		let _currentUser = req["user"]._id;
		let _headers = req.headers;
		UsersDAO
		['updateUser'](_id, _user, _currentUser, _headers)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static updateUserMobile(req: express.Request, res: express.Response):void {
		let _id = req["user"]._id;
		let _user = req.body;
		let _currentUser = req["user"]._id;
		let _headers = req.headers;
		UsersDAO
		['updateUser'](_id, _user, _currentUser, _headers)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static updateUserData(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _type = req.params.type;
		let _userData = req.body;
		let _currentUser = req["user"]._id;
		UsersDAO
		['updateUserData'](_id, _type, _userData, _currentUser)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static changeUserPassword(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _oldpass = req.body.old_password;
		let _newpass = req.body.password;
		let _confpass = req.body.password_confirmation;
		UsersDAO
		['changeUserPassword'](_userId, _oldpass, _newpass, _confpass)
		.then(users => res.status(200).json(users))
		.catch(error => res.status(400).json(error));
	}
	
	static deleteUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _currentUser = req["user"]._id;
		UsersDAO
		['deleteUser'](_id, _currentUser)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static activationUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _user = req.body;
		let _headers = req.headers;
		let _device = req.device.type;
		UsersDAO
		  ['activationUser'](_id, _user, _headers, _device)
		  .then(users => res.status(201).json(users))
		  .catch(error => res.status(400).json(error));
	}

	static verifiedUser(req: express.Request, res: express.Response):void {
		let _id = req["user"]._id;
		let _user = req.body;
		let _headers = req.headers;
		let _device = req.device.type;
		UsersDAO
		  ['verifiedUser'](_id, _user, _headers, _device)
		  .then(users => res.status(201).json(users))
		  .catch(error => res.status(400).json(error));
	}

	static resendCode(req: express.Request, res: express.Response):void {
		let _body = req.body;
		UsersDAO
		['resendCode'](_body)
		.then((user) => res.status(200).json(user))
		.catch(error => res.status(400).json(error));
	}

	static sendActivationCode(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		UsersDAO
		['sendActivationCode'](_id)
		.then((user) => res.status(200).json(user))
		.catch(error => res.status(400).json(error));
	}

	static unActiveUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		UsersDAO
		['unActiveUser'](_id)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static blockUserMobile(req: express.Request, res: express.Response):void {
		let _id = req.body.user_id;
		let _userId = req['user']._id;
		let _headers = req.headers;
		UsersDAO
		['blockUserMobile'](_id, _userId, _headers)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static blockUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _roomId = req.params.roomid;
		let _userId = req['user']._id;
		UsersDAO
		['blockUser'](_id, _userId, _roomId)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static unblockUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req['user']._id;
		let _roomId = req.params.roomid;
		UsersDAO
		['unblockUser'](_id, _userId, _roomId)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static sendResetPassword(req: express.Request, res: express.Response):void {
		let _email = req.body.email;
		UsersDAO
		['sendResetPassword'](_email)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static forgetPassword(req: express.Request, res: express.Response):void {
		let _email = req.body.email;
		let _headers = req.headers;
		UsersDAO
		['forgetPassword'](_email, _headers)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static resetPassword(req: express.Request, res: express.Response):void {
		let _token = req.params.token;
		let _newPassword = req.body;
		UsersDAO
		['resetPassword'](_token, _newPassword)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static resetPasswordMobile(req: express.Request, res: express.Response):void {
		let _data = req.body;
		UsersDAO
		['resetPasswordMobile'](_data)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static refreshToken(req: express.Request, res: express.Response):void {
      let _authorization = req.headers.authorization;
      UsersDAO
        ['refreshToken'](_authorization)
        .then(user => res.status(201).json(user))
        .catch(error => res.status(400).json(error));
  }

	static logout(req: express.Request, res: express.Response):void {
		let _userId = req['user']._id;
		let _authorization = req.headers.authorization;
		UsersDAO
		['logout'](_userId, _authorization)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static privacy(req: express.Request, res: express.Response):void {
		UsersDAO
		['privacy']()
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static terms(req: express.Request, res: express.Response):void {
		UsersDAO
		['terms']()
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static refunds(req: express.Request, res: express.Response):void {
		UsersDAO
		['refunds']()
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}
	
	static setDeviceToken(req: express.Request, res: express.Response):void {
		let _id = req["user"]._id;
		let _data = req.body;
		UsersDAO
		['setDeviceToken'](_id, _data)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static facebookLoginMobile(req: express.Request, res: express.Response):void {
		let _data = req.body;
		UsersDAO
		['facebookLoginMobile'](_data)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}
}