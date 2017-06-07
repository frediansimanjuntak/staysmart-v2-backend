import * as express from 'express';
import DevelopmentsDAO from '../dao/developments-dao';

export class DevelopmentsController {
	static getAll(req: express.Request, res: express.Response):void {
		let _device = req.device.type;
		DevelopmentsDAO
		['getAll'](_device)
		.then(developments => res.status(200).json(developments))
		.catch(error => res.status(400).json(error));
	}

	static developmentsMap(req: express.Request, res: express.Response):void {
		let _searchComponent;
		let _from;
		if (req.device.type.from) {
			_from = 'mobile';
			_searchComponent = req.query;
		}
		else {
			_from = 'web';
			_searchComponent = req.params;
		}
		DevelopmentsDAO
		['developmentsMap'](_searchComponent, _from, req.device.type, req)
		.then(developments => res.status(200).json(developments))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _device = req.device.type;
		let _id = req.params.id;
		let _userId = req["user"]._id;
		DevelopmentsDAO
		['getById'](_id, _userId, _device)
		.then(developments => res.status(200).json(developments))
		.catch(error => res.status(400).json(error));
	}

	static getDevelopment(req: express.Request, res: express.Response):void {
		let _unit = req.params.number_of_units;
		DevelopmentsDAO
		['getDevelopment'](_unit)
		.then(developments => res.status(200).json(developments))
		.catch(error => res.status(400).json(error));
	}

	static getPropertyWithOwnerDevelopment(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _developments = req.body;

		DevelopmentsDAO
		['getPropertyWithOwnerDevelopment'](_id, _developments)
		.then(developments => res.status(200).json(developments))
		.catch(error => res.status(400).json(error));
	}

	static getPropertyDraftWithoutOwnerDevelopment(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _developments = req.body;

		DevelopmentsDAO
		['getPropertyDraftWithoutOwnerDevelopment'](_id, _developments)
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