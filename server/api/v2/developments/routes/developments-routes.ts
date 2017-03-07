"use strict";

import * as express from 'express';
import {DevelopmentsController} from '../controller/developments-controller';
import * as auth from '../../../../auth/auth-service';

export class DevelopmentsRoutes {
	static init(router: express.Router) {
		router
			.route('/developments')
			.get(auth.isAuthenticated(),DevelopmentsController.getAll)
			.post(auth.isAuthenticated(), auth.hasRole('admin'), DevelopmentsController.createDevelopments);

		router
			.route('/developments/:id')
			.get(auth.isAuthenticated(),DevelopmentsController.getById)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), DevelopmentsController.deleteDevelopments);

		router
			.route('/developments/update/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), DevelopmentsController.updateDevelopments);
	}
} 
