"use strict";

import * as express from 'express';
import {CommentsController} from '../controller/comments-controller';
import * as auth from '../../../../auth/auth-service';

export class CommentsRoutes {
	static init(router: express.Router) {
		router
			.route('/comments')
			.get(auth.isAuthenticated(),CommentsController.getAll)
			.post(auth.isAuthenticated(),CommentsController.createComments);

		router
			.route('/comments/:id')
			.get(auth.isAuthenticated(),CommentsController.getById)
			.put(auth.isAuthenticated(),CommentsController.deleteComments)
			.delete(auth.isAuthenticated(),CommentsController.deleteReplies);

		router
			.route('/comments/update/:id')
			.post(auth.isAuthenticated(),CommentsController.updateComments);
	}
}
