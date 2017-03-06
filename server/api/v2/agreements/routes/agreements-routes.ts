"use strict";

import * as express from 'express';
import {AgreementsController} from '../controller/agreements-controller';
import * as auth from '../../../../auth/auth-service';

export class AgreementsRoutes {
	static init(router: express.Router) {
		router
			.route('/agreements')
			.get(auth.isAuthenticated(), AgreementsController.getAll)
			.post(auth.isAuthenticated(), AgreementsController.createAgreements);

		router
			.route('/agreements/:id')
			.get(auth.isAuthenticated(), AgreementsController.getById)
			.delete(auth.isAuthenticated(), AgreementsController.deleteAgreements);	

		router
			.route('/agreements/update/:id')
			.post(auth.isAuthenticated(), AgreementsController.updateAgreements);	

		router
			.route('/agreements/inventorylist/:id')
			.post(auth.isAuthenticated(), AgreementsController.createInventoryList);
			
		router
			.route('/agreements/update/:id/:type')
			.post(AgreementsController.updateAgreementsData);

		//LOI
		router
			.route('/loi/:id')
			.post(AgreementsController.createLoi);

		router
			.route('/loi/status/acccepted/:id')
			.post(AgreementsController.acceptLoi);

		router
			.route('/loi/status/rejected/:id')
			.post(AgreementsController.rejectLoi);

		router
			.route('/loi/status/admin_confirm/:id')
			.post(AgreementsController.adminConfirmationLoi);

		router
			.route('/loi/status/landlord_confirm/:id')
			.post(AgreementsController.landlordConfirmationLoi);
	}
}