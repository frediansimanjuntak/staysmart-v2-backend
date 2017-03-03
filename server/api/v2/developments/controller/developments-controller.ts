import * as express from 'express';
import DevelopmentsDAO from '../dao/developments-dao';

export class DevelopmentsController {
	static getAll(req: express.Request, res: express.Response):void {
		DevelopmentsDAO
		['getAll']()
		.then(developments => res.status(200).json(developments))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		DevelopmentsDAO
		['getById'](_id)
		.then(developments => res.status(200).json(developments))
		.catch(error => res.status(400).json(error));
	}

	static createDevelopments(req: express.Request, res: express.Response):void {
		let _developments = req.body;
		DevelopmentsDAO
		['createDevelopments'](_developments)
		.then(developments => res.status(201).json(developments))
		.catch(error => res.status(400).json(error));
	}

	static deleteDevelopments(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		DevelopmentsDAO
		['deleteDevelopments'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateDevelopments(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _developments = req.body;

		DevelopmentsDAO
		['updateDevelopments'](_id, _developments)
		.then(developments => res.status(201).json(developments))
		.catch(error => res.status(400).json(error));
	}
}