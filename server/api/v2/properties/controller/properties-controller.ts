import * as express from 'express';
import PropertiesDAO from '../dao/properties-dao';

export class PropertiesController {
	static searchProperties(req: express.Request, res: express.Response):void {
		let _searchComponent = req.params;
		PropertiesDAO
		['searchProperties'](_searchComponent)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		PropertiesDAO
		['getById'](_id)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static createProperties(req: express.Request, res: express.Response):void {
		let _properties = req.body;
		let _userId = req["user"]._id;
		PropertiesDAO
		['createProperties'](_properties, _userId)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}
	
	static updateProperties(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _properties = req.body;
		PropertiesDAO
		['updateProperties'](_id, _properties)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static deleteProperties(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		PropertiesDAO
		['deleteProperties'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static confirmationProperty(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _confirmation = req.params.confirmation;
		PropertiesDAO
		['confirmationProperty'](_id, _userId, _confirmation)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static shortlistProperty(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		PropertiesDAO
		['shortlistProperty'](_id, _userId)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static unShortlistProperty(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		PropertiesDAO
		['unShortlistProperty'](_id, _userId)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}
}