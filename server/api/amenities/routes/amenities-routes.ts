"use strict";

import * as express from 'express';
import {AmenitiesController} from '../controller/amenities-controller';

export class AmenitiesRoutes {
	static init(router: express.Router) {
		router
			.route('/api/amenities')
			.get(AmenitiesController.getAll)
			.post(AmenitiesController.createAmenities);

		router
			.route('/api/amenities/:id')
			.get(AmenitiesController.getById)
			.put(AmenitiesController.deleteAmenities);

		router
			.route('/api/amenities/update/:id')
			.post(AmenitiesController.updateAmenities);
	}
}
