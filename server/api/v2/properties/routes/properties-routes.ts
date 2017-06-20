"use strict";

import * as express from 'express';
import {PropertiesController} from '../controller/properties-controller';
import {AttachmentsController} from '../../attachments/controller/attachments-controller';
import * as auth from '../../../../auth/auth-service';

export class PropertiesRoutes {
	static init(router: express.Router) {
		router
			.route('/properties')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), PropertiesController.getAll)
			.post(auth.isAuthenticated(),PropertiesController.createProperties);

		router
			.route('/property')
			.get(auth.isAuthenticated(), PropertiesController.getAll)

		router
			.route('/properties/without_owner')
			.post(auth.isAuthenticated(), auth.hasRole('admin'), PropertiesController.createPropertiesWithoutOwner);

		router
			.route('/properties/browse/:latlng/:pricemin/:pricemax/:bedroom/:bathroom/:available/:sizemin/:sizemax/:location/:radius')
			.get(PropertiesController.searchProperties);

		router
			.route('/browse?:params')
			.get(auth.isAuthenticated(), PropertiesController.searchProperties);

		router
			.route('/me/property')
			.get(auth.isAuthenticated(),PropertiesController.getUserProperties);

		router
			.route('/member/property/:type')
			.get(auth.isAuthenticated(),PropertiesController.memberProperty);
		
		router
			.route('/member/favourite')
			.get(auth.isAuthenticated(), PropertiesController.memberFavourite);

		router
			.route('/properties/draft')
			.get(auth.isAuthenticated(),PropertiesController.getDraft);
		
		router
			.route('/properties/slug/:slug')
			.get(PropertiesController.getBySlug);

		router
			.route('/property/new/step1')
			.post(auth.isAuthenticated(),PropertiesController.step1);

		router
			.route('/property/new/step2')
			.post(auth.isAuthenticated(),PropertiesController.step2);

		router
			.route('/property/new/step2/upload')
			.post(auth.isAuthenticated(), AttachmentsController.createAttachments);

		router
			.route('/property/new/step3')
			.post(auth.isAuthenticated(),PropertiesController.step3);

		router
			.route('/property/new/step3/company')
			.post(auth.isAuthenticated(),PropertiesController.step3Company);

		router
			.route('/property/new/step4')
			.post(auth.isAuthenticated(),PropertiesController.step4);

		router
			.route('/property/new/step5')
			.post(auth.isAuthenticated(),PropertiesController.step5);

		router
			.route('/properties/:id')
			.get(PropertiesController.getById)
			.delete(auth.isAuthenticated(),PropertiesController.deleteProperties);

		router
			.route('/property/:id/remove')
			.post(auth.isAuthenticated(), PropertiesController.deleteProperties);

		//view property for mobile, need login to get req["user"]._id and used it to update seen
		router
			.route('/property/:id')
			.get(auth.isAuthenticated(),PropertiesController.getByIdMobile);
		
		router
			.route('/property/:id/seen')
			.get(auth.isAuthenticated(), PropertiesController.updatePropertySeen);
		
		router
			.route('/schedules/:id/:date')
			.get(auth.isAuthenticated(),PropertiesController.getSchedulesByDate);

		router
			.route('/schedules/:id')
			.get(auth.isAuthenticated(),PropertiesController.getSchedules);

		router
			.route('/properties/update/:id')
			.put(auth.isAuthenticated(),PropertiesController.updateProperties);
		
		router
			.route('/properties/resubmit/:id')
			.post(auth.isAuthenticated(), PropertiesController.resubmitProperty);

		router
			.route('/properties/:confirmation/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), PropertiesController.confirmationProperty);
		
		router
			.route('/favourite')
			.post(auth.isAuthenticated(), PropertiesController.favourite);

		router
			.route('/properties/shortlist_property/:id')
			.post(auth.isAuthenticated(), PropertiesController.shortlistProperty)
			.delete(auth.isAuthenticated(), PropertiesController.unShortlistProperty);

	}
} 
