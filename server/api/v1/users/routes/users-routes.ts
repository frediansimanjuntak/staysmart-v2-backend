"use strict";

import * as express from 'express';
import {UsersController} from '../controller/users-controller';

export class UserRoutes {
	static init(router: express.Router) {
		router
			.route('/users')
			.get(UsersController.getAll)
			.post(UsersController.createUser);

		router
			.route('/users/:id')
			.get(UsersController.getById)
			.put(UsersController.deleteUser);

		router
			.route('/users/update/:id')
			.post(UsersController.updateUser);

		router
			.route('/')
			.get(UsersController.index);

		router
			.route('/me')
			.get(UsersController.me);

	}
}
