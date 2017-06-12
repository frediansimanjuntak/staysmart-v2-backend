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
			.route('/agreements/all')
			.get(auth.isAuthenticated(), auth.hasRole("admin"), AgreementsController.getAllAgreement);

		router
			.route('/agreements/history')
			.get(auth.isAuthenticated(), auth.hasRole("admin"), AgreementsController.getAllHistory);

		router
			.route('/agreements/user')
			.get(auth.isAuthenticated(), AgreementsController.getByUser);		

		router
			.route('/agreements/:id')
			.get(auth.isAuthenticated(), AgreementsController.getById)
			.delete(auth.isAuthenticated(), AgreementsController.deleteAgreements);	

		router
			.route('/agreements/update/:id')
			.post(auth.isAuthenticated(), AgreementsController.updateAgreements);	

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

		router
			.route('/agreement/payment/penalty/:id')
			.post(auth.isAuthenticated(), auth.hasRole("admin"), AgreementsController.penaltyPayment);

		//Inventory List
		router
			.route('/inventorylist')
			.get(auth.isAuthenticated(), AgreementsController.getAllInventoryList);

		router
			.route('/inventorylist/:id')
			.get(auth.isAuthenticated(), AgreementsController.getInventoryList)
			.post(auth.isAuthenticated(), AgreementsController.createInventoryList);
		
		router
			.route('/inventorylist/history/:id')
			.get(auth.isAuthenticated(), AgreementsController.getInventoryListHistories);

		router
			.route('/inventorylist/tenant_checked/:id')
			.post(auth.isAuthenticated(), AgreementsController.tenantCheckInventoryList);
		
		//delete history		
		router
			.route('/delete/history/:type/:idAgreement/:idHistory') //type = {letter_of_intent, tenancy_agreement, inventory_list}
			.post(auth.isAuthenticated(), AgreementsController.deleteHistory);
							
		//LOI
		router
			.route('/loi')
			.get(auth.isAuthenticated(), AgreementsController.getAllLoi);

		router
			.route('/loi/:id')
			.get(auth.isAuthenticated(), AgreementsController.getLoi)
			.post(auth.isAuthenticated(), AgreementsController.createLoi);
		
		router
			.route('/loi/history/:id')
			.get(auth.isAuthenticated(), AgreementsController.getLoiHistories);

		router
			.route('/loi/appointment/:id')
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
			.route('/ta')
			.get(auth.isAuthenticated(), AgreementsController.getAllTa);

		router
			.route('/ta/:id')
			.get(auth.isAuthenticated(), AgreementsController.getTA)
			.post(auth.isAuthenticated(), AgreementsController.createTA);
		
		router
			.route('/ta/history/:id')
			.get(auth.isAuthenticated(), AgreementsController.getTaHistories);

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

		//list certificate
		router
			.route('/list_certificate')
			.get(auth.isAuthenticated(), auth.hasRole('admin'), AgreementsController.getCertificateStampDuty);

		router
			.route('/transfer/landlord/:id')
			.post(auth.isAuthenticated(), auth.hasRole('admin'), AgreementsController.transferToLandlord);

		router
			.route('/transfer/landlord/penalty/:id')
			.post(auth.isAuthenticated(), auth.hasRole('admin'), AgreementsController.transferPenaltyToLandlord);

		//odometer
		router
			.route('/odometer')
			.get(AgreementsController.getOdometer);

		router
			.route('/letter-of-intent/:id/seen')
			.post(auth.isAuthenticated(), AgreementsController.loiSeen);

		router
			.route('/tenancy-agreement/:id/seen')
			.post(auth.isAuthenticated(), AgreementsController.taSeen);
		
		router
			.route('/letter-of-intent/:id/remove')
			.post(auth.isAuthenticated(), AgreementsController.removeLOI);

		router
			.route('/tenancy-agreement/:id/remove')
			.post(auth.isAuthenticated(), AgreementsController.removeTA);
		
		router
			.route('/letter-of-intent/:id/payment-details')
			.get(auth.isAuthenticated(), AgreementsController.loiPayment);

		router
			.route('/tenancy-agreement/:id/payment-details')
			.get(auth.isAuthenticated(), AgreementsController.taPayment);
		
		//mobile api
		router
			.route('/loi/:appoiments_id/payment')
			.get(auth.isAuthenticated(), AgreementsController.updatePaymentProof);
		
		router
			.route('/loi/:appoiments_id/initiate')
			.post(auth.isAuthenticated(), AgreementsController.initiateLoi);
		
		router
			.route('/loi/:appoiments_id/sign')
			.post(auth.isAuthenticated(), AgreementsController.signLoi);
		
		router
			.route('/loi/:appoiments_id/accept')
			.post(auth.isAuthenticated(), AgreementsController.acceptLoi_);
		
		router
			.route('/loi/:appoiments_id/reject')
			.post(auth.isAuthenticated(), AgreementsController.rejectLoi_);

		router
			.route('/inventory/:id')
			.get(auth.isAuthenticated(), AgreementsController.inventoryDetailsMobile)
			.post(auth.isAuthenticated(), AgreementsController.inventoryUpdateMobile);
		
		router 
			.route('/inventory/validate/:id')
			.post(auth.isAuthenticated(). AgreementsController.inventoryUpdateMobile);
	}
}