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

		//Inventory List
		router
			.route('/inventorylist/:id')
			.get(auth.isAuthenticated(), AgreementsController.getInventoryList)
			.post(auth.isAuthenticated(), AgreementsController.createInventoryList);

		router
			.route('/inventorylist/update/:id')
			.post(auth.isAuthenticated(), AgreementsController.updateInventoryList);

		router
			.route('/inventorylist/status/accepted/:id')
			.post(auth.isAuthenticated(), AgreementsController.completedInventoryList);

		router
			.route('/inventorylist/tenantcheck/update/:id')
			.post(auth.isAuthenticated(), AgreementsController.updateTenantCheck);
		
		//confirmation
		router
			.route('/agreement/confirmation/:id')
			.post(auth.isAuthenticated(), AgreementsController.confirmation);

		//payment
		router
			.route('/agreement/payment/:id')
			.post(auth.isAuthenticated(), AgreementsController.payment);

		router
			.route('/agreement/payment/accepted/:id')
			.post(auth.isAuthenticated(), AgreementsController.acceptPayment);

		router
			.route('/agreement/payment/rejected/:id')
			.post(auth.isAuthenticated(), AgreementsController.rejectPayment);
					
		//LOI
		router
			.route('/loi/:id')
			.get(auth.isAuthenticated(), AgreementsController.getLoi)
			.post(auth.isAuthenticated(), AgreementsController.createLoi);

		router
			.route('/loi/send/:id')
			.post(auth.isAuthenticated(), AgreementsController.sendLoi);

		router
			.route('/loi/status/accepted/:id')
			.post(auth.isAuthenticated(), AgreementsController.acceptLoi);

		router
			.route('/loi/status/rejected/:id')
			.post(auth.isAuthenticated(), AgreementsController.rejectLoi);

		router
			.route('/loi/status/admin_confirm/:id')
			.post(auth.isAuthenticated(), AgreementsController.adminConfirmationLoi);

		//TA
		router
			.route('/ta/:id')
			.get(AgreementsController.getTA)
			.post(AgreementsController.createTA);

		router
			.route('/ta/status/acccepted/:id')
			.post(AgreementsController.acceptTA);

		router
			.route('/ta/status/rejected/:id')
			.post(AgreementsController.rejectTA);

		router
			.route('/ta/status/admin_confirm/:id')
			.post(AgreementsController.adminConfirmationTA);
	}
}