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
			.route('/inventorylist/tenant_checked/:id')
			.post(auth.isAuthenticated(), AgreementsController.tenantCheckInventoryList);
		
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
			.post(auth.isAuthenticated(), auth.hasRole("admin"), AgreementsController.acceptPayment);

		router
			.route('/agreement/payment/rejected/:id')
			.post(auth.isAuthenticated(), auth.hasRole("admin"), AgreementsController.rejectPayment);

		router
			.route('/agreement/payment/refund/:id')
			.get(auth.isAuthenticated(), auth.hasRole("admin"), AgreementsController.getTotalRefundPayment)
			.post(auth.isAuthenticated(), auth.hasRole("admin"), AgreementsController.refundPayment);
					
		//LOI
		router
			.route('/loi/:id')
			.get(auth.isAuthenticated(), AgreementsController.getLoi)
			.post(auth.isAuthenticated(), AgreementsController.createLoi);

		router
			.route('/loi/appointment/:idAgreement/:idAppointment')
			.post(auth.isAuthenticated(), AgreementsController.createLoiAppointment);

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
			.get(auth.isAuthenticated(), AgreementsController.getTA)
			.post(auth.isAuthenticated(), AgreementsController.createTA);

		router
			.route('/ta/send/:id')
			.post(auth.isAuthenticated(), AgreementsController.sendTA);

		router
			.route('/ta/status/acccepted/:id')
			.post(auth.isAuthenticated(), AgreementsController.acceptTA);

		router
			.route('/ta/status/rejected/:id')
			.post(auth.isAuthenticated(), AgreementsController.rejectTA);

		router
			.route('/ta/status/admin_confirm/:id')
			.post(auth.isAuthenticated(), AgreementsController.adminConfirmationTA);

		router
			.route('/ta/stamp_certificate/:id')
			.post(auth.isAuthenticated(), auth.hasRole('admin'), AgreementsController.stampCertificateTA);
	}
}