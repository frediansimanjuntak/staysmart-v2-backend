import * as express from 'express';
import BlogCategoriesDAO from '../dao/blog_categories-dao';

export class BlogCategoriesController {
	static getAll(req: express.Request, res: express.Response):void {
		BlogCategoriesDAO
		['getAll']()
		.then(blog_categories => res.status(200).json(blog_categories))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		BlogCategoriesDAO
		['getById'](_id)
		.then(blog_categories => res.status(200).json(blog_categories))
		.catch(error => res.status(400).json(error));
	}

	static getBlogByCategory(req: express.Request, res: express.Response):void {
		let _categoryName = req.params.categoryName;
		BlogCategoriesDAO
		['getBlogByCategory'](_categoryName)
		.then(blog_categories => res.status(200).json(blog_categories))
		.catch(error => res.status(400).json(error));
	}

	static createBlogCategories(req: express.Request, res: express.Response):void {
		let _blog_categories = req.body;
		let _created_by = req["user"]._id;
		BlogCategoriesDAO
		['createBlogCategories'](_blog_categories, _created_by)
		.then(blog_categories => res.status(201).json(blog_categories))
		.catch(error => res.status(400).json(error));
	}

	static deleteBlogCategories(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		BlogCategoriesDAO
		['deleteBlogCategories'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateBlogCategories(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _blog_categories = req.body;

		BlogCategoriesDAO
		['updateBlogCategories'](_id, _blog_categories)
		.then(blog_categories => res.status(201).json(blog_categories))
		.catch(error => res.status(400).json(error));
	}
}