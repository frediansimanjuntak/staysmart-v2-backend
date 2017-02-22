"use strict";

import * as express from 'express';
import {DevelopmentsController} from '../controller/developments-controller';
import * as auth from '../../../../auth/auth-service';

export class DevelopmentsRoutes {
	static init(router: express.Router) {
		router
			.route('/developments')
			.get(auth.isAuthenticated(),DevelopmentsController.getAll)
			.post(auth.isAuthenticated(),DevelopmentsController.createDevelopments);

		router
			.route('/developments/:id')
			.get(auth.isAuthenticated(),DevelopmentsController.getById)
			.put(auth.isAuthenticated(),DevelopmentsController.deleteDevelopments);

		router
			.route('/developments/update/:id')
			.post(auth.isAuthenticated(),DevelopmentsController.updateDevelopments);
	}
} 
