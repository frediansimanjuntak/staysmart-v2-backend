"use strict";

import * as express from 'express';
import {PropertiesController} from '../controller/properties-controller';
import * as auth from '../../../../auth/auth-service';

export class PropertiesRoutes {
	static init(router: express.Router) {
		router
			.route('/properties')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), PropertiesController.getAll)
			.post(auth.isAuthenticated(),PropertiesController.createProperties);

		router
			.route('/properties/without_owner')
			.post(auth.isAuthenticated(), auth.hasRole('admin'), PropertiesController.createPropertiesWithoutOwner);

		router
			.route('/properties/browse/:latlng/:pricemin/:pricemax/:bedroomCount/:bathroomCount/:available/:sizemin/:sizemax/:location/:radius')
			.get(PropertiesController.searchProperties);

		router
			.route('/me/properties')
			.get(auth.isAuthenticated(),PropertiesController.getUserProperties);

		router
			.route('/properties/draft')
			.get(auth.isAuthenticated(),PropertiesController.getDraft);
		
		router
			.route('/properties/slug/:slug')
			.get(PropertiesController.getBySlug);

		router
			.route('/properties/:id')
			.get(PropertiesController.getById)
			.delete(auth.isAuthenticated(),PropertiesController.deleteProperties);

		router
			.route('/properties/update/:id')
			.put(auth.isAuthenticated(),PropertiesController.updateProperties);

		router
			.route('/properties/:confirmation/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), PropertiesController.confirmationProperty);

		router
			.route('/properties/shortlist_property/:id')
			.post(auth.isAuthenticated(), PropertiesController.shortlistProperty)
			.delete(auth.isAuthenticated(), PropertiesController.unShortlistProperty);

	}
} 
