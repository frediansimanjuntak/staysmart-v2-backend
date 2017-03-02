"use strict";

import * as express from 'express';
import {AmenitiesController} from '../controller/amenities-controller';
import * as auth from '../../../../auth/auth-service';

export class AmenitiesRoutes {
	static init(router: express.Router) {
		router
			.route('/amenities')
			.get(auth.isAuthenticated(),AmenitiesController.getAll)
			.post(auth.isAuthenticated(),AmenitiesController.createAmenities);

		router
			.route('/amenities/:id')
			.get(auth.isAuthenticated(),AmenitiesController.getById)
			.delete(auth.isAuthenticated(),AmenitiesController.deleteAmenities);

		router
			.route('/amenities/update/:id')
			.put(auth.isAuthenticated(),AmenitiesController.updateAmenities);
	}
}
