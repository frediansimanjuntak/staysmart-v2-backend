"use strict";

import * as express from 'express';
import {ReportsController} from '../controller/reports-controller';
import * as auth from '../../../../auth/auth-service';

export class NotificationsRoutes {
	static init(router: express.Router) {
		router
			.route('/notifications')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), ReportsController.getAll)
			.post(auth.isAuthenticated(),ReportsController.createReports);

		router
			.route('/notifications/:id')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), ReportsController.getById)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), ReportsController.deleteReports);
		
	}
} 
