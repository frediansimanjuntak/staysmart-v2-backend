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
			.route('/appointments/me')
			.get(auth.isAuthenticated(),AppointmentsController.getByUser);

		router
			.route('/appointments/:id')
			.get(auth.isAuthenticated(),AppointmentsController.getById)
			.delete(auth.isAuthenticated(),AppointmentsController.deleteAppointments);

		router
			.route('/appointments/property/:id')
			.get(auth.isAuthenticated(),AppointmentsController.getByProperty);

		router
			.route('/appointments/update/:id/:status')
			.put(auth.isAuthenticated(),AppointmentsController.updateAppointments);		
		
		router
			.route('/member/appointments/read')
			.post(auth.isAuthenticated(), AppointmentsController.readAppointment);
		
		router
			.route('/loi/:id/check-initiated')
			.get(auth.isAuthenticated(), AppointmentsController.initiateLOICheck);
		
		router
			.route('/member/appointments/:type')
			.get(auth.isAuthenticated(), AppointmentsController.memberSectionAppointment)
			.post(auth.isAuthenticated(), AppointmentsController.memberSectionAction);
	}
}