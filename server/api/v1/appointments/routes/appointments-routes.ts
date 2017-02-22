"use strict";

import * as express from 'express';
import {AppointmentsController} from '../controller/appointments-controller';
import * as auth from '../../../../auth/auth-service';

export class AppointmentsRoutes {
	static init(router: express.Router) {
		router
			.route('/appointments')
			.get(auth.isAuthenticated(),AppointmentsController.getAll)
			.post(auth.isAuthenticated(),AppointmentsController.createAppointments);

		router
			.route('/appointments/:id')
			.get(auth.isAuthenticated(),AppointmentsController.getById)
			.put(auth.isAuthenticated(),AppointmentsController.deleteAppointments);

		router
			.route('/appointments/update/:id')
			.post(auth.isAuthenticated(),AppointmentsController.updateAppointments);
	}
}