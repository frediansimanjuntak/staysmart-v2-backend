import * as express from 'express';
import PropertiesDAO from '../dao/properties-dao';

export class PropertiesController {
	static getAll(req: express.Request, res: express.Response):void {
		let _device = req.device.type;
		let _userId = req["user"]._id;
		let _type = 'browse';
		PropertiesDAO
		['getAll'](_device, _userId, _type)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static searchProperties(req: express.Request, res: express.Response):void {
		let _searchComponent;
		let _from;
		if (req.device.type != 'desktop') {
			_from = 'mobile';
			_searchComponent = req.query;
		}
		else {
			_from = 'web';
			_searchComponent = req.params;
		}
		PropertiesDAO
		['searchProperties'](_searchComponent, _from, req.device.type, req)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static updatePropertySeen(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _user = req["user"]._id;
		PropertiesDAO
		['updatePropertySeen'](_id, _user)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _device = req.device.type;
		let _user = "";
		PropertiesDAO
		['getById'](_id, _user, _device)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static getByIdMobile(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _device = 'phone';
		let _user = req["user"]._id;
		
		PropertiesDAO
		['getById'](_id, _user, _device)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static getSchedules(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _device = req.device.type;
		PropertiesDAO
		['getSchedules'](_id, _device)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static getSchedulesByDate(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _date = req.params.date;
		let _device = req.device.type;
		PropertiesDAO
		['getSchedulesByDate'](_id, _date, _device)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static getBySlug(req: express.Request, res: express.Response):void {
		let _slug = req.params.slug;
		PropertiesDAO
		['getBySlug'](_slug)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static getUserProperties(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _device = req.device.type;
		PropertiesDAO
		['getUserProperties'](_userId, _device)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static memberProperty(req: express.Request, res: express.Response):void {
		let _type = req.params.type;
		let _userId = req["user"]._id;
		let _device = req.device.type;
		PropertiesDAO
		['memberProperty'](_type, _userId, _device)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static memberFavourite(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _device = req.device.type;
		PropertiesDAO
		['memberFavourite'](_userId, _device)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static getDraft(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		PropertiesDAO
		['getDraft'](_userId)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static createProperties(req: express.Request, res: express.Response):void {
		let _properties = req.body;
		let _userRole = req["user"].role;
		let _userId = req["user"]._id;
		let _userEmail = req["user"].email;
		let _userFullname = req["user"].username;
		PropertiesDAO
		['createProperties'](_properties, _userId, _userEmail, _userFullname, _userRole)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static createPropertiesWithoutOwner(req: express.Request, res: express.Response):void {
		let _properties = req.body;
		let _userId = req["user"]._id;
		PropertiesDAO
		['createPropertiesWithoutOwner'](_properties, _userId)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static step1(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _properties = req.body;
		PropertiesDAO
		['step1'](_properties, _userId)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static step2(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _properties = req.body;
		PropertiesDAO
		['step2'](_properties, _userId)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static step3(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _properties = req.body;
		let _files = req["files"];
		PropertiesDAO
		['step3'](_properties, _userId, _files)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static step3Company(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _properties = req.body;
		let _files = req["files"];
		PropertiesDAO
		['step3Company'](_properties, _userId, _files)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static step4(req: express.Request, res: express.Response):void {
		let _body = req.body;
		let _userId = req["user"]._id;
		let _device = req.device.type;
		PropertiesDAO
		['step4'](_body, _userId, _device)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static step5(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		PropertiesDAO
		['step5'](_userId)
		.then(properties => res.status(200).json(properties))
		.catch(error => res.status(400).json(error));
	}
	
	static updateProperties(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _properties = req.body;
		let _userId = req["user"]._id;
		let _userEmail = req["user"].email;
		let _userFullname = req["user"].username;
		PropertiesDAO
		['updateProperties'](_id, _properties, _userId, _userEmail, _userFullname)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static deleteProperties(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _device = req.device.type;
		PropertiesDAO
		['deleteProperties'](_id, _userId, _device)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static confirmationProperty(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _confirmation = req.params.confirmation;
		let _proof = req.body;
		PropertiesDAO
		['confirmationProperty'](_id, _userId, _confirmation, _proof)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static resubmitProperty(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		PropertiesDAO
		['resubmitProperty'](_id, _userId)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static favourite(req: express.Request, res: express.Response):void {
		let _id = req.body.property;
		let _userId = req["user"]._id;

		PropertiesDAO
		['favourite'](_id, _userId)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static shortlistProperty(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		PropertiesDAO
		['shortlistProperty'](_id, _userId)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}

	static unShortlistProperty(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		PropertiesDAO
		['unShortlistProperty'](_id, _userId)
		.then(properties => res.status(201).json(properties))
		.catch(error => res.status(400).json(error));
	}
}