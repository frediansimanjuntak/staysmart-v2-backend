import * as express from 'express';
import CommentsDAO from '../dao/comments-dao';

export class CommentsController {
	static getAll(req: express.Request, res: express.Response):void {
		CommentsDAO
		['getAll']()
		.then(comments => res.status(200).json(comments))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		CommentsDAO
		['getById'](_id)
		.then(comments => res.status(200).json(comments))
		.catch(error => res.status(400).json(error));
	}

	static createComments(req: express.Request, res: express.Response):void {
		let _comments = req.body;
		CommentsDAO
		['createComments'](_comments)
		.then(comments => res.status(201).json(comments))
		.catch(error => res.status(400).json(error));
	}

	static deleteComments(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		CommentsDAO
		['deleteComments'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateComments(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _comments = req.body;

		CommentsDAO
		['updateComments'](_id, _comments)
		.then(comments => res.status(201).json(comments))
		.catch(error => res.status(400).json(error));
	}
}