import * as express from 'express';
import AppointmentsDAO from '../dao/appointments-dao';

export class AppointmentsController {
	static getAll(req: express.Request, res: express.Response):void {
		AppointmentsDAO
		['getAll']()
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		AppointmentsDAO
		['getById'](_id)
		.then(appointments => res.status(200).json(appointments))
		.catch(error => res.status(400).json(error));
	}

	static createAppointments(req: express.Request, res: express.Response):void {
		let _appointments = req.body;
		AppointmentsDAO
		['createAppointments'](_appointments)
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
		let _appointments = req.body;

		AppointmentsDAO
		['updateAppointments'](_id, _appointments)
		.then(appointments => res.status(201).json(appointments))
		.catch(error => res.status(400).json(error));
	}
}