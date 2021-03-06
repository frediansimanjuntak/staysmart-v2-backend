import * as express from 'express';
import AgreementsDAO from '../dao/agreements-dao';

export class AgreementsController {
	static getAllAgreement(req: express.Request, res: express.Response):void {		

		AgreementsDAO
		['getAllAgreement']()
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getAll(req: express.Request, res: express.Response):void {		
		let _userId = req["user"]._id;
		let _role = req["user"].role;

		AgreementsDAO
		['getAll'](_userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getAllHistory(req: express.Request, res: express.Response):void {	

		AgreementsDAO
		['getAllHistory']()
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getByUser(req: express.Request, res: express.Response):void {		
		let _userId = req["user"]._id;
		let _role = req["user"].role;

		AgreementsDAO
		['getByUser'](_userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;

		AgreementsDAO
		['getById'](_id, _userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getOdometer(req: express.Request, res: express.Response):void {	

		AgreementsDAO
		['getOdometer']()
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static loiSeen(req: express.Request, res: express.Response):void {	
		let _id = req.params.id;
		let _userId = req["user"]._id;
		AgreementsDAO
		['loiSeen'](_id, _userId)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static taSeen(req: express.Request, res: express.Response):void {	
		let _id = req.params.id;
		let _userId = req["user"]._id;
		AgreementsDAO
		['taSeen'](_id, _userId)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createAgreements(req: express.Request, res: express.Response):void {
		let _agreements = req.body;
		let _userId = req["user"]._id;

		AgreementsDAO
		['createAgreements'](_agreements, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static deleteAgreements(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['deleteAgreements'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateAgreements(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _agreements = req.body;

		AgreementsDAO
		['updateAgreements'](_id, _agreements)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}	

	//confirmation
	static confirmation(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;

		AgreementsDAO
		['confirmation'](_id, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	//payment
	static payment(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;

		AgreementsDAO
		['payment'](_id, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static acceptPayment(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;

		AgreementsDAO
		['acceptPayment'](_id, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static rejectPayment(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;

		AgreementsDAO
		['rejectPayment'](_id, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static penaltyPayment(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['penaltyPayment'](_id)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getTotalRefundPayment(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['getTotalRefundPayment'](_id, )
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static refundPayment(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;

		AgreementsDAO
		['refundPayment'](_id, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	//LOI
	static getAllLoi(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		AgreementsDAO
		['getAllLoi'](_userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getLoiHistories(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		AgreementsDAO
		['getLoiHistories'](_id, _userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getLoi(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;

		AgreementsDAO
		['getLoi'](_id, _userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getTotalLOINeedApprove(req: express.Request, res: express.Response):void {
		AgreementsDAO
		['getTotalLOINeedApprove']()
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createLoiAppointment(req: express.Request, res: express.Response):void {
		let _idAppointment = req.params.id;
		let _userId = req["user"]._id;

		AgreementsDAO
		['createLoiAppointment'](_idAppointment, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createLoi(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;
		let _userId = req["user"]._id;

		AgreementsDAO
		['createLoi'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static initiateLoi(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.appoiments_id;
		let _userId = req["user"]._id;

		AgreementsDAO
		['initiateLoi'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static signLoi(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.appoiments_id;
		let _userId = req["user"]._id;

		AgreementsDAO
		['signLoi'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static acceptLoi_(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.appoiments_id;
		let _userId = req["user"]._id;

		AgreementsDAO
		['acceptLoi_'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static rejectLoi_(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.appoiments_id;
		let _userId = req["user"]._id;

		AgreementsDAO
		['rejectLoi_'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static sendLoi(req: express.Request, res: express.Response):void {		
		let _id = req.params.id;
		let _userId = req["user"]._id;

		AgreementsDAO
		['sendLoi'](_id, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static acceptLoi(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _data = req.body;
		let _userId = req["user"]._id;
				
		AgreementsDAO
		['acceptLoi'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static rejectLoi(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		let _loi = req.body;

		AgreementsDAO
		['rejectLoi'](_id, _userId, _role, _loi)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static adminConfirmationLoi(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _agreements = req.body;
		
		AgreementsDAO
		['adminConfirmationLoi'](_id, _agreements)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static removeLOI(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		
		AgreementsDAO
		['removeLOI'](_id)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static uploadPaymentLoi(req: express.Request, res: express.Response):void {
		let _id = req.params.appoiments_id;
		let _attachment = req["files"];
		let _userId = req["user"]._id;
		AgreementsDAO
		['uploadPaymentLoi'](_id, _attachment, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static GetLoiStep2(req: express.Request, res: express.Response):void {
		let _id = req.params.appoiments_id;
		
		AgreementsDAO
		['GetLoiStep2'](_id)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	//TA
	static getAllTa(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		AgreementsDAO
		['getAllTa'](_userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getTaHistories(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		AgreementsDAO
		['getTaHistories'](_id, _userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;

		AgreementsDAO
		['getTA'](_id, _userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getTotalTANeedApprove(req: express.Request, res: express.Response):void {
		AgreementsDAO
		['getTotalTANeedApprove']()
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createTA(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;
		let _userId = req["user"]._id;
		
		AgreementsDAO
		['createTA'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static initiateTA_(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.appointment_id;
		let _userId = req["user"]._id;
		
		AgreementsDAO
		['initiateTA_'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static uploadPaymentTA(req: express.Request, res: express.Response):void {
		let _id = req.params.appoiments_id;
		let _attachment = req["files"];
		let _userId = req["user"]._id;
		AgreementsDAO
		['uploadPaymentTA'](_id, _attachment, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static sendTA(req: express.Request, res: express.Response):void {		
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _data = req.body;

		AgreementsDAO
		['sendTA'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static acceptTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _data = req.body;
				
		AgreementsDAO
		['acceptTA'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static rejectTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		let _ta = req.body;

		AgreementsDAO
		['rejectTA'](_id, _userId, _role, _ta)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static tenantRejectTa(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		let _ta = req.body;

		AgreementsDAO
		['tenantRejectTa'](_id, _userId, _role, _ta)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static adminConfirmationTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _agreements = req.body;
		
		AgreementsDAO
		['adminConfirmationTA'](_id, _agreements)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static landlordSign(req: express.Request, res: express.Response):void {
		let _id = req.params.appointment_id;
		let _agreements = req.body;
		
		AgreementsDAO
		['landlordSign'](_id, _agreements)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static tenantAcceptance(req: express.Request, res: express.Response):void {
		let _id = req.params.appointment_id;
		let _agreements = req.body;
		
		AgreementsDAO
		['tenantAcceptance'](_id, _agreements)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static stampCertificateTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _agreements = req.body;
		
		AgreementsDAO
		['stampCertificateTA'](_id, _agreements)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getTotalStampCertificateNotUploaded(req: express.Request, res: express.Response):void {
		AgreementsDAO
		['getTotalStampCertificateNotUploaded']()
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static removeTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		
		AgreementsDAO
		['removeTA'](_id)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static memberSectionOwnedTa(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		
		AgreementsDAO
		['memberSectionOwnedTa'](_userId, _role)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static memberSectionTaById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;		
		AgreementsDAO
		['memberSectionTaById'](_id, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	//IL
	static getAllInventoryList(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		AgreementsDAO
		['getAllInventoryList'](_userId)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getInventoryListHistories(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		AgreementsDAO
		['getInventoryListHistories'](_id, _userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getInventoryList(req: express.Request, res: express.Response):void {
		let _id = req.params.id;	
		let _userId = req["user"]._id;	
		let _role = req["user"].role;

		AgreementsDAO
		['getInventoryList'](_id, _userId, _role)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createInventoryList(req: express.Request, res: express.Response):void {
		console.log(req.body);
		let _id = req.params.id;
		let _agreement = req.body;
		let _userId = req["user"]._id;

		AgreementsDAO
		['createInventoryList'](_id, _agreement, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static tenantCheckInventoryList(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _data = req.body;
		let _userId = req["user"]._id;

		AgreementsDAO
		['tenantCheckInventoryList'](_id, _data, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getCertificateStampDuty(req: express.Request, res: express.Response):void {
		AgreementsDAO
		['getCertificateStampDuty']()
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static transferToLandlord(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _data = req.body;

		AgreementsDAO
		['transferToLandlord'](_id, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static transferPenaltyToLandlord(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _data = req.body;

		AgreementsDAO
		['transferPenaltyToLandlord'](_id, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static deleteHistory(req: express.Request, res: express.Response):void {
		let _type = req.params.type;
		let _idAgreement = req.params.idAgreement;
		let _idHistory = req.params.idHistory;

		AgreementsDAO
		['deleteHistory'](_idAgreement, _idHistory, _type)
		.then(agreement => res.status(201).json(agreement))
		.catch(error => res.status(400).json(error));
	}

	static loiPayment(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['loiPayment'](_id)
		.then(agreement => res.status(201).json(agreement))
		.catch(error => res.status(400).json(error));
	}

	static taPayment(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['taPayment'](_id)
		.then(agreement => res.status(201).json(agreement))
		.catch(error => res.status(400).json(error));
	}
	
	static inventoryUpdateMobile(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _data = req.body;
		AgreementsDAO
		['inventoryUpdateMobile'](_id, _data)
		.then(agreement => res.status(201).json(agreement))
		.catch(error => res.status(400).json(error));
	}

	static inventoryDetailsMobile(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _user = req["user"]._id;
		AgreementsDAO
		['inventoryDetailsMobile'](_id, _user)
		.then(agreement => res.status(201).json(agreement))
		.catch(error => res.status(400).json(error));
	}

	static inventoryListMember(req: express.Request, res: express.Response):void {
		let _user = req["user"]._id;
		AgreementsDAO
		['inventoryListMember'](_user)
		.then(agreement => res.status(201).json(agreement))
		.catch(error => res.status(400).json(error));
	}

	static rejectTAMobile(req: express.Request, res: express.Response):void {
		let _idAppointment = req.params.id;
		let _userId = req["user"]._id;
		let _role = req["user"].role;
		let _ta = req.body;

		AgreementsDAO
		['rejectTAMobile'](_idAppointment, _userId, _role, _ta)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getUserLOI(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		AgreementsDAO
		['getUserLOI'](_userId)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getUserLOIByLOIID(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _loiId = req.params.loi_id;
		AgreementsDAO
		['getUserLOIByLOIID'](_userId, _loiId)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}
}