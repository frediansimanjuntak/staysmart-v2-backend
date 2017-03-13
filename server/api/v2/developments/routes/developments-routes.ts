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
			.route('/developments/filter/:number_of_units')
			.get(DevelopmentsController.getDevelopment)

		router
			.route('/developments/:id')
			.get(DevelopmentsController.getById)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), DevelopmentsController.deleteDevelopments);

		router
			.route('/developments/update/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), DevelopmentsController.updateDevelopments);
	}
} 
