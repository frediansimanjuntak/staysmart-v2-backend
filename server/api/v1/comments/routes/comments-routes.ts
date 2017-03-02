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
			.delete(auth.isAuthenticated(),CommentsController.deleteComments)
			.put(auth.isAuthenticated(),CommentsController.deleteReplies);

		router
			.route('/comments/update/:id')
			.put(auth.isAuthenticated(),CommentsController.updateComments);
	}
}
