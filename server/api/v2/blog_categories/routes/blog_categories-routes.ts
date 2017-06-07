"use strict";

import * as express from 'express';
import {BlogCategoriesController} from '../controller/blog_categories-controller';
import * as auth from '../../../../auth/auth-service';

export class BlogCategoriesRoutes {
	static init(router: express.Router) {
		router
			.route('/blog-categories')
			.get(BlogCategoriesController.getAll)
			.post(auth.isAuthenticated(), auth.hasRole('admin'), BlogCategoriesController.createBlogCategories);

		router
			.route('/category')
			.get(auth.isAuthenticated(), BlogCategoriesController.getAll)

		router
			.route('/blog-categories/:id')
			.get(BlogCategoriesController.getById)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), BlogCategoriesController.deleteBlogCategories);

		router
			.route('/blog/category/:categoryName')
			.get(BlogCategoriesController.getBlogByCategory)

		router
			.route('/blog-categories/update/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), BlogCategoriesController.updateBlogCategories);
	}
}
