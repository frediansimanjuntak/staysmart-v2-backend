"use strict";

import * as express from 'express';
import {FaqsController} from '../controller/faqs-controller';

export class FaqsRoutes {
	static init(router: express.Router) {
		router
			.route('/api/faqs')
			.get(FaqsController.getAll)
			.post(FaqsController.createFaqs);

		router
			.route('/api/faqs/:id')
			.get(FaqsController.getById)
			.put(FaqsController.deleteFaqs);

		router
			.route('/api/faqs/filter/:filter')
			.get(FaqsController.getByFilter)

		router
			.route('/api/faqs/update/:id')
			.post(FaqsController.updateFaqs);
	}
}
