"use strict";

import * as express from 'express';
import {PaymentsController} from '../controller/payments-controller';

export class PaymentRoutes{
	static init (router: express.Router) {
		router
			.route('/api/payments')
			.get(PaymentsController.getAll)
			.post(PaymentsController.createPayment);

		router
			.route('/api/payments/:id')
			.get(PaymentsController.getById)
			.post(PaymentsController.deletePayment);

		router
			.route('/api/payments/update/:id')
			.post(PaymentsController.updatePayment);
	}
}