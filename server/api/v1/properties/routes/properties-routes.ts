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
			.route('/properties/details/update/:id')
			.put(auth.isAuthenticated(),PropertiesController.updateDetails);
	
		router
			.route('/properties/pictures/:id')
			.post(auth.isAuthenticated(),PropertiesController.createPropertyPictures);

		router
			.route('/properties/pictures/delete/:id/:type/:pictureID')
			.delete(auth.isAuthenticated(),PropertiesController.deletePropertyPictures);

		router
			.route('/properties/schedules/update/:id')
			.put(auth.isAuthenticated(),PropertiesController.updatePropertySchedules)

		router
			.route('/properties/schedules/delete/:id/:idSchedule')
			.delete(auth.isAuthenticated(),PropertiesController.deletePropertySchedules);

		router
			.route('/properties/shareholder/update/:id')
			.put(auth.isAuthenticated(),PropertiesController.updatePropertyShareholder);
	}
} 
