"use strict";

import * as express from 'express';
import {AttachmentsController} from '../controller/attachments-controller';

export class AttachmentsRoutes {
	static init(router: express.Router) {
		router
			.route('/attachments')
			.get(AttachmentsController.getAll)
			.post(AttachmentsController.createAttachments);

		router
			.route('/attachments/:id')
			.get(AttachmentsController.getById)
			.put(AttachmentsController.deleteAttachments);

		router
			.route('/attachments/update/:id')
			.post(AttachmentsController.updateAttachments);
	}
} 
