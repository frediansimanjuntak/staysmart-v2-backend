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
			.route('/properties/update/:id/:shareholderID')
			.put(auth.isAuthenticated(),PropertiesController.updatePropertiesShareholder);

		router
			.route('/properties/pictures/delete/:id/:type/:pictureID')
			.delete(auth.isAuthenticated(),PropertiesController.deletePropertyPictures);

		router
			.route('/properties/shareholder/delete/:id/:idShareholder')
			.delete(auth.isAuthenticated(),PropertiesController.deletePropertyShareholder);
	}
} 
