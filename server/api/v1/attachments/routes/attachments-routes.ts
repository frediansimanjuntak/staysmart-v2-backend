"use strict";

import * as express from 'express';
import {AttachmentsController} from '../controller/attachments-controller';
import * as auth from '../../../../auth/auth-service';

export class AttachmentsRoutes {
	static init(router: express.Router) {
		router
			.route('/attachments')
			.get(auth.isAuthenticated(),AttachmentsController.getAll)
			.post(auth.isAuthenticated(),AttachmentsController.createAttachments);

		router
			.route('/attachments/:id')
			.get(auth.isAuthenticated(),AttachmentsController.getById)
			.delete(auth.isAuthenticated(),AttachmentsController.deleteAttachments);
	}
} 
