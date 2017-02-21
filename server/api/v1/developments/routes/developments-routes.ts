"use strict";

import * as express from 'express';
import {DevelopmentsController} from '../controller/developments-controller';

export class DevelopmentsRoutes {
	static init(router: express.Router) {
		router
			.route('/developments')
			.get(DevelopmentsController.getAll)
			.post(DevelopmentsController.createDevelopments);

		router
			.route('/developments/:id')
			.get(DevelopmentsController.getById)
			.put(DevelopmentsController.deleteDevelopments);

		router
			.route('/developments/update/:id')
			.post(DevelopmentsController.updateDevelopments);
	}
} 
