"use strict";

import * as express from 'express';
import {FaqsController} from '../controller/faqs-controller';
import * as auth from '../../../../auth/auth-service';

export class FaqsRoutes {
	static init(router: express.Router) {
		router
			.route('/faqs')
			.get(FaqsController.getAll)
			.post(auth.isAuthenticated(), auth.hasRole('admin'), FaqsController.createFaqs);

		router
			.route('/faq')
			.get(auth.isAuthenticated(), FaqsController.getAll)

		router
			.route('/faqs/:id')
			.get(FaqsController.getById)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), FaqsController.deleteFaqs);

		router
			.route('/faqs/filter/:filter')
			.get(FaqsController.getByFilter)

		router
			.route('/faqs/update/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), FaqsController.updateFaqs);
	}
}
