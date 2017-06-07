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

	static addComments(req: express.Request, res: express.Response):void {
		let _comments = req.body;
		let _id = req.params.id;
		let _device = req.device.type;
		CommentsDAO
		['addComments'](_comments, _id, _device)
		.then(comments => res.status(201).json(comments))
		.catch(error => res.status(400).json(error));
	}

	static deleteReplies(req: express.Request, res: express.Response):void {
		let _idComment = req.params.id;
		let reply = req.body;
		let _currentUser = req["user"]._id;
		CommentsDAO
		['deleteReplies'](_idComment, reply, _currentUser)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static deleteComments(req: express.Request, res: express.Response):void {
		let _idComment = req.params.id;
		let _currentUser = req["user"]._id;
		CommentsDAO
		['deleteComments'](_idComment, _currentUser)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateComments(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _comments = req.body;
		let _currentUser = req["user"]._id;
		CommentsDAO
		['updateComments'](_id, _comments, _currentUser)
		.then(comments => res.status(201).json(comments))
		.catch(error => res.status(400).json(error));
	}

	static sendSubscribeBlog(req: express.Request, res: express.Response):void {
		let _id = req.params.idblog;
		CommentsDAO
		['sendSubscribeBlog'](_id)
		.then(comments => res.status(201).json(comments))
		.catch(error => res.status(400).json(error));
	}

	static unSubscribeBlog(req: express.Request, res: express.Response):void {
		let reply = req.body;
		CommentsDAO
		['unSubscribeBlog'](reply)
		.then(comments => res.status(201).json(comments))
		.catch(error => res.status(400).json(error));
	}
}