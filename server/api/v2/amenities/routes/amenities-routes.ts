"use strict";

import * as express from 'express';
import {AmenitiesController} from '../controller/amenities-controller';
import * as auth from '../../../../auth/auth-service';

export class AmenitiesRoutes {
	static init(router: express.Router) {
		router
			.route('/amenities')
			.get(AmenitiesController.getAll)
			.post(auth.isAuthenticated(), auth.hasRole('admin'), AmenitiesController.createAmenities);

		router
			.route('/amenity')
			.get(auth.isAuthenticated(), AmenitiesController.getAll)

		router
			.route('/amenities/:id')
			.get(auth.isAuthenticated(),AmenitiesController.getById)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), AmenitiesController.deleteAmenities);

		router
			.route('/amenities/update/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), AmenitiesController.updateAmenities);
	}
}
