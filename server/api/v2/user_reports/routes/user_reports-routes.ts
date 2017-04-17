"use strict";

import * as express from 'express';
import {UserReportsController} from '../controller/user_reports-controller';
import * as auth from '../../../../auth/auth-service';

export class UserReportsRoutes {
	static init(router: express.Router) {
		router
			.route('/user_reports')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), UserReportsController.getAll)
			.post(auth.isAuthenticated(),UserReportsController.createUserReports);

		router
			.route('/user_reports/count')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), UserReportsController.getGroupCount);

		router
			.route('/user_reports/:id')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), UserReportsController.getById);

		router
			.route('/user_reports/reported/:reported')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), UserReportsController.getByReported)
			.post(auth.isAuthenticated(), auth.hasRole('admin'), UserReportsController.reportUser)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), UserReportsController.deleteUserReports);
		
	}
} 
