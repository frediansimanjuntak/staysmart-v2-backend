import * as express from 'express';
import AmenitiesDAO from '../dao/amenities-dao';

export class AmenitiesController {
	static getAll(req: express.Request, res: express.Response):void {
		AmenitiesDAO
		['getAll']()
		.then(amenities => res.status(200).json(amenities))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		AmenitiesDAO
		['getById'](_id)
		.then(amenities => res.status(200).json(amenities))
		.catch(error => res.status(400).json(error));
	}

	static createAmenities(req: express.Request, res: express.Response):void {
		let _amenities = req.body;
		AmenitiesDAO
		['createAmenities'](_amenities)
		.then(amenities => res.status(201).json(amenities))
		.catch(error => res.status(400).json(error));
	}

	static deleteAmenities(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		AmenitiesDAO
		['deleteAmenities'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateAmenities(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _amenities = req.body;

		AmenitiesDAO
		['updateAmenities'](_id, _amenities)
		.then(amenities => res.status(201).json(amenities))
		.catch(error => res.status(400).json(error));
	}
}