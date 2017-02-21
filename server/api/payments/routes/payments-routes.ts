"use strict";

import * as express from 'express';
import {PaymentsController} from '../controller/payments-controller';

export class PaymentsRoutes {
	static init(router: express.Router) {
		router
			.route('/api/payments')
			.get(PaymentsController.getAll)
			.post(PaymentsController.createPayments);

		router
			.route('/api/payments/:id')
			.get(PaymentsController.getById)
			.put(PaymentsController.deletePayments);

		router
			.route('/api/payments/update/:id')
			.post(PaymentsController.updatePayments);
	}
}
