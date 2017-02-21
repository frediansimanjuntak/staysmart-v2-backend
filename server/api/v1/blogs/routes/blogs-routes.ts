"use strict";

import * as express from 'express';
import {BlogsController} from '../controller/blogs-controller';

export class BlogsRoutes {
	static init(router: express.Router) {
		router
			.route('/blogs')
			.get(BlogsController.getAll)
			.post(BlogsController.createBlogs);

		router
			.route('/blogs/:id')
			.get(BlogsController.getById)
			.put(BlogsController.deleteBlogs);

		router
			.route('/blogs/update/:id')
			.post(BlogsController.updateBlogs);
	}
}
