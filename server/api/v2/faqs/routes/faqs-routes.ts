"use strict";

import * as express from 'express';
import {FaqsController} from '../controller/faqs-controller';
import * as auth from '../../../../auth/auth-service';

export class FaqsRoutes {
	static init(router: express.Router) {
		router
			.route('/faqs')
			.get(auth.isAuthenticated(),FaqsController.getAll)
			.post(auth.isAuthenticated(), auth.hasRole('admin'), FaqsController.createFaqs);

		router
			.route('/faqs/:id')
			.get(auth.isAuthenticated(),FaqsController.getById)
			.delete(auth.isAuthenticated(), auth.hasRole('admin'), FaqsController.deleteFaqs);

		router
			.route('/faqs/filter/:filter')
			.get(auth.isAuthenticated(),FaqsController.getByFilter)

		router
			.route('/faqs/update/:id')
			.put(auth.isAuthenticated(), auth.hasRole('admin'), FaqsController.updateFaqs);
	}
}
