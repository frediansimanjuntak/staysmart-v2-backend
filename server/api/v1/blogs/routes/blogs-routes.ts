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
			.route('/blogs/:id')
			.get(auth.isAuthenticated(),BlogsController.getById)
			.put(auth.isAuthenticated(),BlogsController.deleteBlogs);

		router
			.route('/blogs/update/:id')
			.post(auth.isAuthenticated(),BlogsController.updateBlogs);
	}
}
