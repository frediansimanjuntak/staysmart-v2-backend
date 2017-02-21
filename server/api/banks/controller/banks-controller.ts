import * as express from 'express';
import BanksDAO from '../dao/banks-dao';

export class BanksController {
	static getAll(req: express.Request, res: express.Response):void {
		BanksDAO
		['getAll']()
		.then(banks => res.status(200).json(banks))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		BanksDAO
		['getById'](_id)
		.then(banks => res.status(200).json(banks))
		.catch(error => res.status(400).json(error));
	}

	static getByFilter(req: express.Request, res: express.Response):void {
		let _filter = req.params.filter;
		BanksDAO
		['getByFilter'](_filter)
		.then(banks => res.status(200).json(banks))
		.catch(error => res.status(400).json(error));
	}

	static createBanks(req: express.Request, res: express.Response):void {
		let _banks = req.body;
		BanksDAO
		['createBanks'](_banks)
		.then(banks => res.status(201).json(banks))
		.catch(error => res.status(400).json(error));
	}

	static deleteBanks(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		BanksDAO
		['deleteBanks'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateBanks(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _banks = req.body;

		BanksDAO
		['updateBanks'](_id, _banks)
		.then(banks => res.status(201).json(banks))
		.catch(error => res.status(400).json(error));
	}
}