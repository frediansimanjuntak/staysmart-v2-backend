"use strict";

import * as express from 'express';
import {FaqsController} from '../controller/faqs-controller';

export class FaqsRoutes {
	static init(router: express.Router) {
		router
			.route('/faqs')
			.get(FaqsController.getAll)
			.post(FaqsController.createFaqs);

		router
			.route('/faqs/:id')
			.get(FaqsController.getById)
			.put(FaqsController.deleteFaqs);

		router
			.route('/faqs/filter/:filter')
			.get(FaqsController.getByFilter)

		router
			.route('/faqs/update/:id')
			.post(FaqsController.updateFaqs);
	}
}
