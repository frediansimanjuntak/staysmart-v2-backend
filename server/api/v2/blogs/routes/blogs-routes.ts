"use strict";

import * as express from 'express';
import {BlogsController} from '../controller/blogs-controller';
import * as auth from '../../../../auth/auth-service';

export class BlogsRoutes {
	static init(router: express.Router) {
		router
			.route('/blogs')
			.get(BlogsController.getAll)
			.post(auth.isAuthenticated(), auth.hasRole('admin'), BlogsController.createBlogs);

		router
			.route('/blogs/:slug')
			.get(BlogsController.getById);

		router
			.route('/blogs/:id')
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), BlogsController.deleteBlogs);

		router
			.route('/blogs/update/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), BlogsController.updateBlogs);
	}
}
