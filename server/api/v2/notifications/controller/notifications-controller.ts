import * as express from 'express';
import NotificationsDAO from '../dao/notifications-dao';

export class NotificationsController {
	static getAll(req: express.Request, res: express.Response):void {
		NotificationsDAO
		['getAll']()
		.then(notifications => res.status(200).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static getAllLimit(req: express.Request, res: express.Response):void {
		let _limit = req.params.limit;
		let _userId = req["user"]._id;

		NotificationsDAO
		['getAllLimit'](_limit, _userId)
		.then(notifications => res.status(200).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		NotificationsDAO
		['getById'](_id)
		.then(notifications => res.status(200).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static getByUser(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		NotificationsDAO
		['getByUser'](_userId)
		.then(notifications => res.status(200).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static readNotifications(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		NotificationsDAO
		['readNotifications'](_userId)
		.then(notifications => res.status(201).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static clickNotifications(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		NotificationsDAO
		['readNotifications'](_id)
		.then(notifications => res.status(201).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static createNotifications(req: express.Request, res: express.Response):void {
		let _notifications = req.body;
		NotificationsDAO
		['createNotifications'](_notifications)
		.then(notifications => res.status(201).json(notifications))
		.catch(error => res.status(400).json(error));
	}

	static deleteNotifications(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		NotificationsDAO
		['deleteNotifications'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateNotifications(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		NotificationsDAO
		['updateNotifications'](_id)
		.then(notifications => res.status(201).json(notifications))
		.catch(error => res.status(400).json(error));
	}
}