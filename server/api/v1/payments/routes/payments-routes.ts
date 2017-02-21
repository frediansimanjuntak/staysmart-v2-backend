"use strict";

import * as express from 'express';
import {PaymentsController} from '../controller/payments-controller';

export class PaymentsRoutes {
	static init(router: express.Router) {
		router
			.route('/payments')
			.get(PaymentsController.getAll)
			.post(PaymentsController.createPayments);

		router
			.route('/payments/:id')
			.get(PaymentsController.getById)
			.put(PaymentsController.deletePayments);

		router
			.route('/payments/update/:id')
			.post(PaymentsController.updatePayments);
	}
}
