import * as express from 'express';
import AgreementsDAO from '../dao/agreements-dao';

export class AgreementsController {
	static getAll(req: express.Request, res: express.Response):void {
		
		let _userId = req["user"]._id;

		AgreementsDAO
		['getAll'](_userId)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['getById'](_id)
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
	static getLoi(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['getLoi'](_id)
		.then(agreements => res.status(200).json(agreements))
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

	static sendLoi(req: express.Request, res: express.Response):void {		
		let _id = req.params.id;

		AgreementsDAO
		['createLoi'](_id)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static acceptLoi(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _data = req.body;
				
		AgreementsDAO
		['acceptLoi'](_id, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static rejectLoi(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['rejectLoi'](_id)
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

	//TA
	static getTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['getTA'](_id)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createTA(req: express.Request, res: express.Response):void {
		let _data = req.body;
		let _id = req.params.id;
		
		AgreementsDAO
		['createTA'](_id, _data)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static acceptTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _files = req["files"];
				
		AgreementsDAO
		['acceptTA'](_id, _files)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static rejectTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AgreementsDAO
		['rejectTA'](_id)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static adminConfirmationTA(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _agreements = req.body;
		let _files = req["files"];
		
		AgreementsDAO
		['adminConfirmationTA'](_id, _agreements, _files)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	//IL
	static getInventoryList(req: express.Request, res: express.Response):void {
		let _id = req.params.id;		

		AgreementsDAO
		['getInventoryList'](_id)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static createInventoryList(req: express.Request, res: express.Response):void {
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
		let _agreement = req.body;
		let _userId = req["user"]._id;

		AgreementsDAO
		['tenantCheckInventoryList'](_id, _agreement, _userId)
		.then(agreements => res.status(201).json(agreements))
		.catch(error => res.status(400).json(error));
	}
}