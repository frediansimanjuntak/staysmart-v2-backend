"use strict";

import * as express from 'express';
import {ManagersController} from '../controller/managers-controller';
import * as auth from '../../../../auth/auth-service';

export class ManagersRoutes {
	static init(router: express.Router) {
		router
			.route('/managers')
			.get(auth.isAuthenticated(),ManagersController.getAll)
			.post(auth.isAuthenticated(),ManagersController.createManagers);

		router
			.route('/managers/:id')
			.get(auth.isAuthenticated(),ManagersController.getManagers)
			.delete(auth.isAuthenticated(),ManagersController.deleteManagers);

		router
			.route('/managers/own/:id/:idmanager')
			.get(auth.isAuthenticated(),ManagersController.getOwnManager);

		router
			.route('/managers/update/:id')
			.put(auth.isAuthenticated(),ManagersController.updateManagers);

		router
			.route('/managers/accept/:id')
			.post(auth.isAuthenticated(),ManagersController.acceptManagers);

		router
			.route('/managers/reject/:id')
			.post(auth.isAuthenticated(),ManagersController.rejectManagers);	
	}
} 
