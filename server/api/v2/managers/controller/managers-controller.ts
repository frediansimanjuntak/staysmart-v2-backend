import * as express from 'express';
import ManagersDAO from '../dao/managers-dao';

export class ManagersController {
	static getAll(req: express.Request, res: express.Response):void {
		ManagersDAO
		['getAll']()
		.then(notifications => res.status(200).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static getManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		ManagersDAO
		['getManagers'](_id)
		.then(notifications => res.status(200).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static getOwnManager(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _idManager = req.params.idmanager;

		ManagersDAO
		['getOwnManager'](_id, _idManager)
		.then(notifications => res.status(200).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static createManagers(req: express.Request, res: express.Response):void {
		let _notifications = req.body;
		let _userId = req["user"]._id;

		ManagersDAO
		['createManagers'](_userId, _notifications)
		.then(notifications => res.status(201).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static deleteManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		ManagersDAO
		['deleteManagers'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		ManagersDAO
		['updateManagers'](_id)
		.then(notifications => res.status(201).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static acceptManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		ManagersDAO
		['acceptManagers'](_id, _userId)
		.then(notifications => res.status(201).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static rejectManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		ManagersDAO
		['rejectManagers'](_id, _userId)
		.then(notifications => res.status(201).json(notifications))
		.catch(error => res.status(400).json(error));
	}
}