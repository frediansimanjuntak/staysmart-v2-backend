import * as express from 'express';
import ChatsDAO from '../dao/chats-dao';

export class ChatsController {
	static requestToken(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _username = req["user"].username;
		ChatsDAO
		['requestToken'](_userId, _username)
		.then(blogs => res.status(200).json(blogs))
		.catch(error => res.status(400).json(error));
	}

	static insertChatRoom(req: express.Request, res: express.Response):void {
		let _users = req.body.user;
		let _rooms = req.body.rooms;
		ChatsDAO
		['insertChatRoom'](_users, _rooms)
		.then(blogs => res.status(200).json(blogs))
		.catch(error => res.status(400).json(error));
	}
}