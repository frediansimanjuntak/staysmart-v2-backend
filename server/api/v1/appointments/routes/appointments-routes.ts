"use strict";

import * as express from 'express';
import {AppointmentsController} from '../controller/appointments-controller';

export class AppointmentsRoutes {
	static init(router: express.Router) {
		router
			.route('/appointments')
			.get(AppointmentsController.getAll)
			.post(AppointmentsController.createAppointments);

		router
			.route('/appointments/:id')
			.get(AppointmentsController.getById)
			.put(AppointmentsController.deleteAppointments);

		router
			.route('/appointments/update/:id')
			.post(AppointmentsController.updateAppointments);
	}
}