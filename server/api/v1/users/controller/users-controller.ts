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
		let _userId = req.user._id;
		UsersDAO
		['me'](_userId)
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

	static updateUserData(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _type = req.params.type;
		let _user = req.body;
		let _front = req["front"].attachment;
		let _back = req["back"].attachment;
		UsersDAO
		['updateUserData'](_id, _type, _user, _front, _back)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}
	
	static deleteUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		UsersDAO
		['deleteUser'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _user = req.body;

		UsersDAO
		['updateUser'](_id, _user)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}

	static activationUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _code = req.params.code;

		UsersDAO
		  ['activationUser'](_id, _code)
		  .then(users => res.status(201).json(users))
		  .catch(error => res.status(400).json(error));
	}

	static unActiveUser(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		UsersDAO
		['unActiveUser'](_id)
		.then(users => res.status(201).json(users))
		.catch(error => res.status(400).json(error));
	}
}