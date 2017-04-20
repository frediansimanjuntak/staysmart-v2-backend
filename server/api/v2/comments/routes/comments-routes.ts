"use strict";

import * as express from 'express';
import {CommentsController} from '../controller/comments-controller';
import * as auth from '../../../../auth/auth-service';

export class CommentsRoutes {
	static init(router: express.Router) {
		router
			.route('/comments')
			.get(CommentsController.getAll)
			.post(CommentsController.createComments);

		router
			.route('/comments/:id')
			.get(CommentsController.getById)
			.delete(auth.isAuthenticated(),CommentsController.deleteComments)
			
		router
			.route('/replies/:id')
			.delete(auth.isAuthenticated(),CommentsController.deleteReplies);

		router
			.route('/comments/update/:id')
			.put(auth.isAuthenticated(),CommentsController.updateComments);

		router
			.route('/comments/send_subscribe/:idblog')
			.post(CommentsController.sendSubscribeBlog);
	}
}
