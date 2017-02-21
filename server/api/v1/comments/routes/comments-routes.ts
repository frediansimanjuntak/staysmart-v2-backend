"use strict";

import * as express from 'express';
import {CommentsController} from '../controller/comments-controller';

export class CommentsRoutes {
	static init(router: express.Router) {
		router
			.route('/comments')
			.get(CommentsController.getAll)
			.post(CommentsController.createComments);

		router
			.route('/comments/:id')
			.get(CommentsController.getById)
			.put(CommentsController.deleteComments);

		router
			.route('/comments/update/:id')
			.post(CommentsController.updateComments);
	}
}
