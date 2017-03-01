import * as express from 'express';
import PropertiesDAO from '../dao/properties-dao';

export class PropertiesController {
	static getAll(req: express.Request, res: express.Response):void {
		PropertiesDAO
		['getAll']()
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
		let _files = req["files"];
		PropertiesDAO
		['createProperties'](_properties, _files)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static createPropertyPictures(req: express.Request, res: express.Response):void {
		let _propertyID = req.params.id;
		let _living = req["files"].living;
		let _dining = req["files"].dining;
		let _bed = req["files"].bed;
		let _toilet = req["files"].toilet;
		let _kitchen = req["files"].kitchen;
		PropertiesDAO
		['createPropertyPictures'](_propertyID, _living, _dining, _bed, _toilet, _kitchen)
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

	static deletePropertyShareholder(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _idShareholder = req.params.idShareholder;

		PropertiesDAO
		['deletePropertyShareholder'](_id, _idShareholder)
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

	static deletePropertyPictures(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _type = req.params.type;
		let _pictureID = req.params.pictureID;
		PropertiesDAO
		['deletePropertyPictures'](_id, _type, _pictureID)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}
}