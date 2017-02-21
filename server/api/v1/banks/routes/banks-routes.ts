"use strict";

import * as express from 'express';
import {BanksController} from '../controller/banks-controller';

export class BanksRoutes {
	static init(router: express.Router) {
		router
			.route('/banks')
			.get(BanksController.getAll)
			.post(BanksController.createBanks);

		router
			.route('/banks/:id')
			.get(BanksController.getById)
			.put(BanksController.deleteBanks);

		router
			.route('/banks/update/:id')
			.post(BanksController.updateBanks);
	}
} 
