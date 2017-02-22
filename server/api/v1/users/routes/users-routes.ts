"use strict";

import * as express from 'express';
import {UsersController} from '../controller/users-controller';
import * as auth from '../../../../auth/auth-service';

export class UserRoutes {
	static init(router: express.Router) {
		router
			.route('/users')
			.get(auth.isAuthenticated(), UsersController.getAll)
			.post(auth.isAuthenticated(), UsersController.createUser);

		router
			.route('/users/data/:id/:type')
			.post(auth.isAuthenticated(), UsersController.updateUserData);

		router
			.route('/users/:id')
			.get(auth.isAuthenticated(), UsersController.getById)
			.put(auth.isAuthenticated(), UsersController.deleteUser);

		router
			.route('/users/update/:id')
			.post(auth.isAuthenticated(), UsersController.updateUser);

		router
			.route('/')
			.get(auth.isAuthenticated(), UsersController.index);

		router
			.route('/me')
			.get(auth.isAuthenticated(), UsersController.me);

		router
			.route('/users/active/:id/:code')
			.post(auth.isAuthenticated(), UsersController.activationUser);

		router
			.route('/users/unactive/:id')
			.post(auth.isAuthenticated(), UsersController.unActiveUser);

	}
}
