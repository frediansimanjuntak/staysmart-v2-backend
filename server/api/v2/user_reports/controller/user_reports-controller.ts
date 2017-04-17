import * as express from 'express';
import UserReportsDAO from '../dao/user_reports-dao';

export class UserReportsController {
	static getAll(req: express.Request, res: express.Response):void {
		UserReportsDAO
		['getAll']()
		.then(reports => res.status(200).json(reports))
		.catch(error => res.status(400).json(error));
	}

	static getGroupCount(req: express.Request, res: express.Response):void {
		UserReportsDAO
		['getGroupCount']()
		.then(reports => res.status(200).json(reports))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		UserReportsDAO
		['getById'](_id)
		.then(reports => res.status(200).json(reports))
		.catch(error => res.status(400).json(error));
	}

	static getByReported(req: express.Request, res: express.Response):void {
		let _reported = req.params.reported;

		UserReportsDAO
		['getByReported'](_reported)
		.then(reports => res.status(200).json(reports))
		.catch(error => res.status(400).json(error));
	}

	static createUserReports(req: express.Request, res: express.Response):void {
		let _reports = req.body;
		let _userId = req["user"]._id;

		UserReportsDAO
		['createUserReports'](_reports, _userId)
		.then(reports => res.status(201).json(reports))
		.catch(error => res.status(400).json(error));
	}

	static reportUser(req: express.Request, res: express.Response):void {
		let _reported = req.params.reported;
		
		UserReportsDAO
		['reportUser'](_reported)
		.then(reports => res.status(200).json(reports))
		.catch(error => res.status(400).json(error));
	}

	static deleteUserReports(req: express.Request, res: express.Response):void {
		let _reported = req.params.reported;
		
		UserReportsDAO
		['deleteUserReports'](_reported)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}
}