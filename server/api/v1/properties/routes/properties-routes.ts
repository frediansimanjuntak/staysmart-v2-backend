"use strict";

import * as express from 'express';
import {PropertiesController} from '../controller/properties-controller';

export class PropertiesRoutes {
	static init(router: express.Router) {
		router
			.route('/properties')
			.get(PropertiesController.getAll)
			.post(PropertiesController.createProperties);

		router
			.route('/properties/:id')
			.get(PropertiesController.getById)
			.put(PropertiesController.deleteProperties);

		router
			.route('/properties/update/:id')
			.post(PropertiesController.updateProperties);
	}
} 
