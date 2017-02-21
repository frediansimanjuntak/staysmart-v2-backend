"use strict";

import * as express from 'express';
import {BlogCategoriesController} from '../controller/blog_categories-controller';

export class BlogCategoriesRoutes {
	static init(router: express.Router) {
		router
			.route('/api/blog-categories')
			.get(BlogCategoriesController.getAll)
			.post(BlogCategoriesController.createBlogCategories);

		router
			.route('/api/blog-categories/:id')
			.get(BlogCategoriesController.getById)
			.put(BlogCategoriesController.deleteBlogCategories);

		router
			.route('/api/blog-categories/update/:id')
			.post(BlogCategoriesController.updateBlogCategories);
	}
}
