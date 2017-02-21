"use strict";

import * as express from 'express';
import {BanksController} from '../controller/banks-controller';

export class BanksRoutes {
	static init(router: express.Router) {
		router
			.route('/api/banks')
			.get(BanksController.getAll)
			.post(BanksController.createBanks);

		router
			.route('/api/banks/:id')
			.get(BanksController.getById)
			.put(BanksController.deleteBanks);

		router
			.route('/api/banks/update/:id')
			.post(BanksController.updateBanks);
	}
}
