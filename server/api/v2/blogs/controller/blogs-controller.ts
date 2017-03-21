import * as express from 'express';
import BlogsDAO from '../dao/blogs-dao';

export class BlogsController {
	static getAll(req: express.Request, res: express.Response):void {
		BlogsDAO
		['getAll']()
		.then(blogs => res.status(200).json(blogs))
		.catch(error => res.status(400).json(error));
	}

	static getBySlug(req: express.Request, res: express.Response):void {
		let _slug = req.params.slug;
		BlogsDAO
		['getBySlug'](_slug)
		.then(blogs => res.status(200).json(blogs))
		.catch(error => res.status(400).json(error));
	}

	static createBlogs(req: express.Request, res: express.Response):void {
		let _blogs = req.body;
		let _covers = req["files"].cover;
		let _created_by = req["user"]._id;
		BlogsDAO
		['createBlogs'](_blogs, _covers, _created_by)
		.then(blogs => res.status(201).json(blogs))
		.catch(error => res.status(400).json(error));
	}

	static deleteBlogs(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		BlogsDAO
		['deleteBlogs'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateBlogs(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _blogs = req.body;
		let _covers = req["files"].cover;
		BlogsDAO
		['updateBlogs'](_id, _blogs, _covers)
		.then(blogs => res.status(201).json(blogs))
		.catch(error => res.status(400).json(error));
	}
}