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
			.route('/properties/new/step1')
			.post(auth.isAuthenticated(),PropertiesController.step1);

		router
			.route('/properties/new/step2')
			.post(auth.isAuthenticated(),PropertiesController.step2);

		router
			.route('/properties/new/step3')
			.post(auth.isAuthenticated(),PropertiesController.step3);

		router
			.route('/properties/new/step5')
			.post(auth.isAuthenticated(),PropertiesController.step5);

		router
			.route('/properties/:id')
			.get(PropertiesController.getById)
			.delete(auth.isAuthenticated(),PropertiesController.deleteProperties);

		//view property for mobile, need login to get req["user"]._id and used it to update seen
		router
			.route('/properties/:id/view')
			.get(auth.isAuthenticated(),PropertiesController.getByIdMobile)

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
