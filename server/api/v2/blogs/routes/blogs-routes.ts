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
			.route('/blog')
			.get(BlogsController.getAll)

		router
			.route('/blogs/slug/:slug')
			.get(BlogsController.getBySlug);

		router
			.route('/blogs/:id')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), BlogsController.getById)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), BlogsController.deleteBlogs);

		router
			.route('/blog/:id')
			.get(auth.isAuthenticated(), BlogsController.getById)

		router
			.route('/blogs/update/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), BlogsController.updateBlogs);
		
		//mobile api
		router
			.route('/blog/:id/subscribe')
			.post(auth.isAuthenticated(), BlogsController.subscribeBlog);
	}
}
