"use strict";

import * as express from 'express';
import {BlogsController} from '../controller/blogs-controller';
import * as auth from '../../../../auth/auth-service';

export class BlogsRoutes {
	static init(router: express.Router) {
		router
			.route('/blogs')
			.get(auth.isAuthenticated(),BlogsController.getAll)
			.post(auth.isAuthenticated(),BlogsController.createBlogs);

		router
			.route('/blogs/:slug')
			.get(auth.isAuthenticated(),BlogsController.getById);

		router
			.route('/blogs/:id')
			.delete(auth.isAuthenticated(),BlogsController.deleteBlogs);

		router
			.route('/blogs/update/:id')
			.put(auth.isAuthenticated(),BlogsController.updateBlogs);
	}
}
