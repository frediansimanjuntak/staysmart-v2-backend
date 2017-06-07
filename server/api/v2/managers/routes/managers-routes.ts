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
			.route('/me/manager-details/:type')
			.get(auth.isAuthenticated(), ManagersController.getManagerDetails);

		router
			.route('/me/manager')
			.post(auth.isAuthenticated(), ManagersController.addManagers);
		
		router
			.route('/me/manager/confirm')
			.post(auth.isAuthenticated(), ManagersController.confirmManagers);

		router
			.route('/managers/find_own')
			.get(auth.isAuthenticated(),ManagersController.getOwnManager);

		router
			.route('/managers/:id')
			.get(auth.isAuthenticated(),ManagersController.getById)
			.delete(auth.isAuthenticated(),ManagersController.deleteManagers);	

		router
			.route('/managers/property/:id')
			.delete(auth.isAuthenticated(),ManagersController.deleteUserManagers);	

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
