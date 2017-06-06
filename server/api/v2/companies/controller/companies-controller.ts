import * as express from 'express';
import CompaniesDAO from '../dao/companies-dao';

export class CompaniesController {
	static getAll(req: express.Request, res: express.Response):void {
		CompaniesDAO
		['getAll']()
		.then(companies => res.status(200).json(companies))
		.catch(error => res.status(400).json(error));
	}

	static getUserCompany(req: express.Request, res: express.Response):void {
		let _device = req.device.type;
		let _userId = req["user"]._id;
		CompaniesDAO
		['getUserCompany'](_userId, _device)
		.then(companies => res.status(200).json(companies))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		CompaniesDAO
		['getById'](_id)
		.then(companies => res.status(200).json(companies))
		.catch(error => res.status(400).json(error));
	}

	static createCompanies(req: express.Request, res: express.Response):void {
		let _companies = req.body;
		let _created_by = req["user"]._id;
		CompaniesDAO
		['createCompanies'](_companies, _created_by)
		.then(companies => res.status(201).json(companies))
		.catch(error => res.status(400).json(error));
	}

	static deleteCompanies(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _currentUser = req["user"]._id;
		CompaniesDAO
		['deleteCompanies'](_id, _currentUser)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateCompanies(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _companies = req.body;
		let _currentUser = req["user"]._id;
		CompaniesDAO
		['updateCompanies'](_id, _companies, _currentUser)
		.then(companies => res.status(201).json(companies))
		.catch(error => res.status(400).json(error));
	}
}