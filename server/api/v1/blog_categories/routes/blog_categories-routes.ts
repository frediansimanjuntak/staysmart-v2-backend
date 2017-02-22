"use strict";

import * as express from 'express';
import {BlogCategoriesController} from '../controller/blog_categories-controller';
import * as auth from '../../../../auth/auth-service';

export class BlogCategoriesRoutes {
	static init(router: express.Router) {
		router
			.route('/blog-categories')
			.get(auth.isAuthenticated(),BlogCategoriesController.getAll)
			.post(auth.isAuthenticated(),BlogCategoriesController.createBlogCategories);

		router
			.route('/blog-categories/:id')
			.get(auth.isAuthenticated(),BlogCategoriesController.getById)
			.put(auth.isAuthenticated(),BlogCategoriesController.deleteBlogCategories);

		router
			.route('/blog-categories/update/:id')
			.post(auth.isAuthenticated(),BlogCategoriesController.updateBlogCategories);
	}
}
