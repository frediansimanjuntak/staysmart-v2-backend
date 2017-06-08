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
			.route('/upload')
			.post(auth.isAuthenticated(),AttachmentsController.createAttachments);
			
		router
			.route('/attachments/:id')
			.get(auth.isAuthenticated(),AttachmentsController.getById)
			.delete(auth.isAuthenticated(),AttachmentsController.deleteAttachments);	
		
		router
			.route('/attachments/delete/many')
			.post(auth.isAuthenticated(),AttachmentsController.deleteManyAttachments);
		
		router
			.route('/inventory/photo/:id/remove')
			.post(auth.isAuthenticated, AttachmentsController.deleteAttachments);
	}
} 
