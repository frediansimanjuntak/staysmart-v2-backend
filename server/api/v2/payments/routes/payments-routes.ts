"use strict";

import * as express from 'express';
import {PaymentsController} from '../controller/payments-controller';
import * as auth from '../../../../auth/auth-service';

export class PaymentsRoutes {
	static init(router: express.Router) {
		router
			.route('/payments')
			.get(auth.isAuthenticated(),PaymentsController.getAll)
			.post(auth.isAuthenticated(),PaymentsController.createPayments);

		router
			.route('/payments/:id')
			.get(auth.isAuthenticated(),PaymentsController.getById)
			.delete(auth.isAuthenticated(),PaymentsController.deletePayments);

		router
			.route('/payments/update/:id')
			.put(auth.isAuthenticated(),PaymentsController.updatePayments);
	}
}
