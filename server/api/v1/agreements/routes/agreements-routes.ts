"use strict";

import * as express from 'express';
import {AgreementsController} from '../controller/agreements-controller';

export class AgreementsRoutes {
	static init(router: express.Router) {
		router
			.route('/agreements')
			.get(AgreementsController.getAll)
			.post(AgreementsController.createAgreements);

		router
			.route('/agreements/:id')
			.get(AgreementsController.getById)
			.put(AgreementsController.deleteAgreements);

		router
			.route('/agreements/update/:id')
			.post(AgreementsController.updateAgreements);
		router
			.route('/agreements/update/:id/:type')
			.post(AgreementsController.updateAgreementsData);
	}
}