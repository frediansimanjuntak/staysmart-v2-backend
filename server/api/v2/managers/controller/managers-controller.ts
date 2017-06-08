import * as express from 'express';
import ManagersDAO from '../dao/managers-dao';

export class ManagersController {
	static getAll(req: express.Request, res: express.Response):void {

		ManagersDAO
		['getAll']()
		.then(managers => res.status(200).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static getManagerProperties(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		ManagersDAO
		['getManagerProperties'](_userId)
		.then(managers => res.status(200).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static getManagerDetails(req: express.Request, res: express.Response):void {
		let _type = req.params.type;
		let _device = req.device.type;
		let _userId = req["user"]._id;
		ManagersDAO
		['getManagerDetails'](_type, _device, _userId)
		.then(managers => res.status(200).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		ManagersDAO
		['getById'](_id)
		.then(managers => res.status(200).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static getOwnManager(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;

		ManagersDAO
		['getOwnManager'](_userId)
		.then(managers => res.status(200).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static addManagers(req: express.Request, res: express.Response):void {
		let _manager = req.body;
		let _userId = req["user"]._id;

		ManagersDAO
		['addManagers'](_userId, _manager)
		.then(managers => res.status(201).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static createManagers(req: express.Request, res: express.Response):void {
		let _manager = req.body;
		let _userId = req["user"]._id;

		ManagersDAO
		['createManagers'](_userId, _manager)
		.then(managers => res.status(201).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static deleteManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		ManagersDAO
		['deleteManagers'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static deleteUserManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		ManagersDAO
		['deleteUserManagers'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		ManagersDAO
		['updateManagers'](_id)
		.then(managers => res.status(201).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static confirmManagers(req: express.Request, res: express.Response):void {
		let _managers = req.body;

		ManagersDAO
		['confirmManagers'](_managers)
		.then(managers => res.status(201).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static acceptManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		ManagersDAO
		['acceptManagers'](_id, _userId)
		.then(managers => res.status(201).json(managers))
		.catch(error => res.status(400).json(error));
	}

	static rejectManagers(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		ManagersDAO
		['rejectManagers'](_id, _userId)
		.then(managers => res.status(201).json(managers))
		.catch(error => res.status(400).json(error));
	}
}