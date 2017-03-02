"use strict";

import * as express from 'express';
import {AgreementsController} from '../controller/agreements-controller';
import * as auth from '../../../../auth/auth-service';

export class AgreementsRoutes {
	static init(router: express.Router) {
		router
			.route('/agreements')
			.get(auth.isAuthenticated(),AgreementsController.getAll)
			.post(auth.isAuthenticated(),AgreementsController.createAgreements);

		router
			.route('/agreements/:id')
			.get(AgreementsController.getById)
			.delete(AgreementsController.deleteAgreements);

		router
			.route('/agreements/update/:id')
			.put(AgreementsController.updateAgreements);
		router
			.route('/agreements/update/:id/:type')
			.put(AgreementsController.updateAgreementsData)
			.get(auth.isAuthenticated(),AgreementsController.getById)
			.put(auth.isAuthenticated(),AgreementsController.deleteAgreements);

		router
			.route('/agreements/update/:id')
			.post(auth.isAuthenticated(),AgreementsController.updateAgreements);
		router
			.route('/agreements/update/:id/:type')
			.post(auth.isAuthenticated(),AgreementsController.updateAgreementsData);

		router
			.route('/agreements/inventorylist/update/:id')
			.post(auth.isAuthenticated(),AgreementsController.updateInventoryList);

	}
}