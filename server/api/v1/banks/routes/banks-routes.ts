"use strict";

import * as express from 'express';
import {BanksController} from '../controller/banks-controller';
import * as auth from '../../../../auth/auth-service';

export class BanksRoutes {
	static init(router: express.Router) {
		router
			.route('/banks')
			.get(auth.isAuthenticated(),BanksController.getAll)
			.post(auth.isAuthenticated(),BanksController.createBanks);

		router
			.route('/banks/:id')
			.get(auth.isAuthenticated(),BanksController.getById)
			.delete(auth.isAuthenticated(),BanksController.deleteBanks);

		router
			.route('/banks/update/:id')
			.put(auth.isAuthenticated(),BanksController.updateBanks);
	}
} 
