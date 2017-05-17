import * as express from 'express';
import SubscribesDAO from '../dao/subscribes-dao';

export class SubscribesController {
	static getAll(req: express.Request, res: express.Response):void {
		SubscribesDAO
		['getAll']()
		.then(subscribes => res.status(200).json(subscribes))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		SubscribesDAO
		['getById'](_id)
		.then(subscribes => res.status(200).json(subscribes))
		.catch(error => res.status(400).json(error));
	}

	static createSubscribes(req: express.Request, res: express.Response):void {
		let _subscribes = req.body;

		SubscribesDAO
		['createSubscribes'](_subscribes)
		.then(subscribes => res.status(201).json(subscribes))
		.catch(error => res.status(400).json(error));
	}

	static unSubscribes(req: express.Request, res: express.Response):void {
		let _subscribes = req.body;
		
		SubscribesDAO
		['unSubscribes'](_subscribes)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static deleteSubscribes(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		SubscribesDAO
		['deleteSubscribes'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static deleteManySubscribes(req: express.Request, res: express.Response):void {
		let _subscribes = req.body;

		SubscribesDAO
		['deleteManySubscribes'](_subscribes)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}
}