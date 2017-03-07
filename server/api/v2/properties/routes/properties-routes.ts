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
			.delete(auth.isAuthenticated(),PropertiesController.deleteProperties);

		router
			.route('/properties/update/:id')
			.put(auth.isAuthenticated(),PropertiesController.updateProperties);

		router
			.route('/properties/pictures/delete/:id/:type/:pictureID')
			.delete(auth.isAuthenticated(),PropertiesController.deletePropertyPictures);

		router
			.route('/properties/:confirmation/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), PropertiesController.confirmationProperty);

		router
			.route('/properties/shortlist_property/:id')
			.post(auth.isAuthenticated(), PropertiesController.shortlistProperty)
			.put(auth.isAuthenticated(), PropertiesController.unShortlistProperty);
		
	}
} 
