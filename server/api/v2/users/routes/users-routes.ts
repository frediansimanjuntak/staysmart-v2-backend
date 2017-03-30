"use strict";

import * as express from 'express';
import {UsersController} from '../controller/users-controller';
import * as auth from '../../../../auth/auth-service';

export class UserRoutes {
	static init(router: express.Router) {
		router
			.route('/users')
			.get(auth.isAuthenticated(),  UsersController.getAll)
			.post(auth.isAuthenticated(), auth.hasRole('admin'), UsersController.createUser);

		router
			.route('/signup')
			.post(UsersController.signUp);

		router
			.route('/users/:id')
			.get(auth.isAuthenticated(), UsersController.getById)
			.delete(auth.isAuthenticated(), UsersController.deleteUser);

		router
			.route('/users/update/:id')
			.put(auth.isAuthenticated(), UsersController.updateUser);
			
		router
			.route('/users/data/:id/:type')
			.put(auth.isAuthenticated(), UsersController.updateUserData);

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

		router
			.route('/users/search/:search')
			.get(auth.isAuthenticated(), UsersController.searchUser);

		router
			.route('/users/check/:search')
			.get(UsersController.checkUserData);

		router
			.route('/users/property/nonmanager')
			.get(auth.isAuthenticated(), UsersController.getPropertyNonManager);

	}
}
