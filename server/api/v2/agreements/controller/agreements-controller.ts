import * as express from 'express';
import AgreementsDAO from '../dao/agreements-dao';

export class AgreementsController {
	static getAll(req: express.Request, res: express.Response):void {
		AgreementsDAO
		['getAll']()
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['getById'](_id)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createAgreements(req: express.Request, res: express.Response):void {
		let _agreements = req.body;
		let _userId = req["user"].id;

		AgreementsDAO
		['createAgreements'](_agreements, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static deleteAgreements(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['deleteAgreements'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateAgreements(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _agreements = req.body;

		AgreementsDAO
		['updateAgreements'](_id, _agreements)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createLoi(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;
		let _files = req["files"];
		
		AgreementsDAO
		['createLoi'](_id, _data, _files)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static updateAgreementsData(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;
		let _type = req.params.type;

		AgreementsDAO
		['updateAgreementsData'](_id, _type, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createInventoryList(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _inventorylist = req.body;

		AgreementsDAO
		['createInventoryList'](_id, _inventorylist)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}
}