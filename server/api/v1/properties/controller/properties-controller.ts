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
		
		PropertiesDAO
		['createProperties'](_properties)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static updateDetails(req: express.Request, res: express.Response):void {
		let _properties = req.body;
		let _id = req.params.id;

		PropertiesDAO
		['updateDetails'](_id, _properties)
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

	static updatePropertySchedules(req: express.Request, res: express.Response):void {
		let _id = req.params.id
		let _schedules = req.body;
		PropertiesDAO
		['updatePropertySchedules'](_id, _schedules)
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

	static deletePropertySchedules(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _idSchedule = req.params.idSchedule;
		PropertiesDAO
		['deletePropertySchedules'](_id, _idSchedule)
		.then(() => res.status(200).end())
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

	static updatePropertyShareholder(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _shareholder = req.body;
		let _front = req["files"].front;
		let _back = req["files"].back;

		console.log(_shareholder);
		console.log(_front);
		console.log(_back);
		console.log(req);

		PropertiesDAO
		['updatePropertyShareholder'](_id, _shareholder, _front, _back)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}
}