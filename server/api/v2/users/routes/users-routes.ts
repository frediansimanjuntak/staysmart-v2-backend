"use strict";

import * as express from 'express';
import {UsersController} from '../controller/users-controller';
import * as auth from '../../../../auth/auth-service';

export class UserRoutes {
	static init(router: express.Router) {
		router
			.route('/users')
			.get(auth.isAuthenticated(), UsersController.getAll)
			.post(UsersController.createUser);

		router
			.route('/users/:id')
			.get(auth.isAuthenticated(), UsersController.getById)
			.delete(auth.isAuthenticated(), UsersController.deleteUser);

		router
			.route('/users/update/:id')
			.post(auth.isAuthenticated(), UsersController.updateUser);
			
		router
			.route('/users/data/:id/:type')
			.post(auth.isAuthenticated(), UsersController.updateUserData);

		router
			.route('/')
			.get(auth.isAuthenticated(), UsersController.index);

		router
			.route('/me')
			.get(auth.isAuthenticated(), UsersController.me);

		router
			.route('/users/activate/:id')
			.post(auth.isAuthenticated(), UsersController.activationUser);

		router
			.route('/users/verification_code/:id')
			.get(auth.isAuthenticated(), UsersController.sendActivationCode);

		router
			.route('/users/unactive/:id')
			.post(auth.isAuthenticated(), UsersController.unActiveUser);

		router
			.route('/users/block/:id')
			.put(auth.isAuthenticated(), UsersController.blockUser);

		router
			.route('/users/unblock/:id')
			.put(auth.isAuthenticated(), UsersController.unblockUser);

		router
			.route('/send_reset_password')
			.post(UsersController.sendResetPassword);

		router
			.route('/reset_password/:token')
			.post(UsersController.resetPassword);

	}
}
