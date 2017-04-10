"use strict";

import * as express from 'express';
import {NotificationsController} from '../controller/notifications-controller';
import * as auth from '../../../../auth/auth-service';

export class NotificationsRoutes {
	static init(router: express.Router) {
		router
			.route('/notifications')
			.get(auth.isAuthenticated(),NotificationsController.getAll)
			.post(auth.isAuthenticated(),NotificationsController.createNotifications);

		router
			.route('/notifications/:id')
			.get(auth.isAuthenticated(),NotificationsController.getById)
			.delete(auth.isAuthenticated(),NotificationsController.deleteNotifications);

		router
			.route('/notifications/user')
			.get(auth.isAuthenticated(),NotificationsController.getByUser);

		router
			.route('/notifications/update/:id')
			.put(auth.isAuthenticated(),NotificationsController.updateNotifications);
	}
} 
