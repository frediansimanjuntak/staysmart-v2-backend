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
			.route('/change/password')
			.post(auth.isAuthenticated(), UsersController.changeUserPassword);

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
			.get(auth.isAuthenticated(), UsersController.me)
			.post(auth.isAuthenticated(), UsersController.updateMe);
		
		router
			.route('/me/phone')
			.post(auth.isAuthenticated(), UsersController.updateUser);

		router
			.route('/me/:type')
			.get(auth.isAuthenticated(), UsersController.meData);

		router
			.route('/users/activate/:id')
			.post(auth.isAuthenticated(), UsersController.activationUser);

		router
			.route('/verification')
			.post(auth.isAuthenticated(), UsersController.verifiedUser);
		
		router
			.route('/resendcode')
			.post(auth.isAuthenticated(), UsersController.resendCode);

		router
			.route('/users/verification_code/:id')
			.post(auth.isAuthenticated(), UsersController.sendActivationCode);

		router
			.route('/users/unactive/:id')
			.post(auth.isAuthenticated(), UsersController.unActiveUser);
		
		router
			.route('/block')
			.post(auth.isAuthenticated(), UsersController.blockUserMobile);

		router
			.route('/users/block/:id/:roomid')
			.put(auth.isAuthenticated(), UsersController.blockUser);

		router
			.route('/users/unblock/:id/:roomid')
			.put(auth.isAuthenticated(), UsersController.unblockUser);

		router
			.route('/send_reset_password')
			.post(UsersController.sendResetPassword);
		
		router
			.route('/forget-password')
			.post(UsersController.forgetPassword);

		router
			.route('/forget-password/verification')
			.post(UsersController.resetPasswordMobile);

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
			
		router
			.route('/refresh_token')
			.get(UsersController.refreshToken);

		router
			.route('/logout')
			.get(auth.isAuthenticated(), UsersController.logout);

		//mobile api
		router
			.route('/username')
			.post(UsersController.username);

		router
			.route('/privacy')
			.get(auth.isAuthenticated(), UsersController.privacy);
		
		router
			.route('/terms')
			.get(auth.isAuthenticated(), UsersController.terms);
		
		router
			.route('/refunds')
			.get(auth.isAuthenticated(), UsersController.refunds);
	}
}
