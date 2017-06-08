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
			.route('/notifications/user')
			.get(auth.isAuthenticated(),NotificationsController.getByUser);

		router
			.route('/notifications/:id')
			.get(auth.isAuthenticated(),NotificationsController.getById)
			.delete(auth.isAuthenticated(),NotificationsController.deleteNotifications);		

		router
			.route('/notifications/update/:id')
			.post(auth.isAuthenticated(),NotificationsController.updateNotifications);
		
		router
			.route('/notification/unread')
			.post(auth.isAuthenticated(), NotificationsController.readNotif);

		router
			.route('/notification/unread')
			.get(auth.isAuthenticated(), NotificationsController.getUnreadCount);

		router
			.route('/notifications/read')
			.post(auth.isAuthenticated(),NotificationsController.readNotifications);

		router
			.route('/notifications/click/:id')
			.post(auth.isAuthenticated(),NotificationsController.clickNotifications);

		router
			.route('/notifications/limit/:limit')
			.get(auth.isAuthenticated(),NotificationsController.getAllLimit);
	}
} 
