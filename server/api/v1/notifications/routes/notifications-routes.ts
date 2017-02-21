"use strict";

import * as express from 'express';
import {NotificationsController} from '../controller/notifications-controller';

export class NotificationsRoutes {
	static init(router: express.Router) {
		router
			.route('/notifications')
			.get(NotificationsController.getAll)
			.post(NotificationsController.createNotifications);

		router
			.route('/notifications/:id')
			.get(NotificationsController.getById)
			.put(NotificationsController.deleteNotifications);

		router
			.route('/notifications/update/:id')
			.post(NotificationsController.updateNotifications);
	}
} 
