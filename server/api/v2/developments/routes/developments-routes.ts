"use strict";

import * as express from 'express';
import {DevelopmentsController} from '../controller/developments-controller';
import * as auth from '../../../../auth/auth-service';

export class DevelopmentsRoutes {
	static init(router: express.Router) {
		router
			.route('/developments')
			.get(DevelopmentsController.getAll)
			.post(auth.isAuthenticated(), auth.hasRole('admin'), DevelopmentsController.createDevelopments);

		router
			.route('/development')
			.get(DevelopmentsController.getAll)

		router
			.route('/developments/browse/:latlng/:pricemin/:pricemax/:bedroom/:bathroom/:available/:sizemin/:sizemax/:location/:radius')
			.get(DevelopmentsController.developmentsMap);

		router
			.route('/developments/filter/:number_of_units')
			.get(DevelopmentsController.getDevelopment)

		router
			.route('/developments/:id')
			.get(auth.isAuthenticated(), DevelopmentsController.getById)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), DevelopmentsController.deleteDevelopments);

		router
			.route('/development/:id')
			.get(auth.isAuthenticated(), DevelopmentsController.getById)

		router
			.route('/developments/update/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), DevelopmentsController.updateDevelopments);

		router
			.route('/developments/:id/property/owner/')
			.post(auth.isAuthenticated(), DevelopmentsController.getPropertyWithOwnerDevelopment);

		router
			.route('/developments/:id/property/draft/no_owner')
			.post(auth.isAuthenticated(), DevelopmentsController.getPropertyDraftWithoutOwnerDevelopment);
	}
} 
