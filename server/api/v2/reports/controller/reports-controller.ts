import * as express from 'express';
import ReportsDAO from '../dao/reports-dao';

export class ReportsController {
	static getAll(req: express.Request, res: express.Response):void {
		ReportsDAO
		['getAll']()
		.then(reports => res.status(200).json(reports))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		ReportsDAO
		['getById'](_id)
		.then(reports => res.status(200).json(reports))
		.catch(error => res.status(400).json(error));
	}

	static createReports(req: express.Request, res: express.Response):void {
		let _reports = req.body;
		ReportsDAO
		['createReports'](_reports)
		.then(reports => res.status(201).json(reports))
		.catch(error => res.status(400).json(error));
	}

	static deleteReports(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		ReportsDAO
		['deleteReports'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}
}