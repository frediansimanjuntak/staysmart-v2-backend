"use strict";

import * as express from 'express';
import {PropertiesController} from '../controller/properties-controller';
import * as auth from '../../../../auth/auth-service';

export class PropertiesRoutes {
	static init(router: express.Router) {
		router
			.route('/properties')
			.get(auth.isAuthenticated(),PropertiesController.getAll)
			.post(auth.isAuthenticated(),PropertiesController.createProperties);

		router
			.route('/properties/:id')
			.get(auth.isAuthenticated(),PropertiesController.getById)
			.put(auth.isAuthenticated(),PropertiesController.deleteProperties);

		router
			.route('/properties/update/:id')
			.post(auth.isAuthenticated(),PropertiesController.updateProperties);

		router
			.route('/properties/pictures/:id')
			.post(auth.isAuthenticated(),PropertiesController.createPropertyPictures);

		router
			.route('/properties/pictures/delete/:id/:type/:pictureID')
			.post(auth.isAuthenticated(),PropertiesController.deletePropertyPictures);
	}
} 
