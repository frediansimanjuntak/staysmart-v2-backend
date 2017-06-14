import * as express from 'express';
import AppointmentsDAO from '../dao/appointments-dao';

export class AppointmentsController {
	static getAll(req: express.Request, res: express.Response):void {
		AppointmentsDAO
		['getAll']()
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static getByUser(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		AppointmentsDAO
		['getByUser'](_userId)
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static getByProperty(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		AppointmentsDAO
		['getByProperty'](_id)
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;
		AppointmentsDAO
		['getById'](_id, _userId)
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static readAppointment(req: express.Request, res: express.Response):void {
		let _id = req.body.appointment_id;
		let _userId = req["user"]._id;
		AppointmentsDAO
		['readAppointment'](_id, _userId)
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static initiateLOICheck(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		AppointmentsDAO
		['initiateLOICheck'](_id)
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static memberSectionAppointment(req: express.Request, res: express.Response):void {
		let _type = req.params.type;
		let _userId = req["user"]._id;
		AppointmentsDAO
		['memberSectionAppointment'](_type, _userId)
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static memberSectionAction(req: express.Request, res: express.Response):void {
		let _type = req.params.type;
		let _userId = req["user"]._id;
		let _data = req.body;
		AppointmentsDAO
		['memberSectionAction'](_type, _data, _userId)
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static createAppointments(req: express.Request, res: express.Response):void {
		let _appointments = req.body;
		let _tenant = req["user"]._id;
		AppointmentsDAO
		['createAppointments'](_appointments, _tenant)
		.then(appointments => res.status(201).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static deleteAppointments(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		AppointmentsDAO
		['deleteAppointments'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateAppointments(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _status = req.params.status;

		AppointmentsDAO
		['updateAppointments'](_id, _status)
		.then(appointments => res.status(201).json(appointments))
		.catch(error => res.status(400).json(error));
	}
}