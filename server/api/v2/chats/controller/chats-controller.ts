import * as express from 'express';
import ChatsDAO from '../dao/chats-dao';

export class ChatsController {
	static requestToken(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id.toString();
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

	static requestPeer(req: express.Request, res: express.Response):void {
		let _roomName = req.params.roomName;
		let _userId = req["user"]._id.toString();
		ChatsDAO
		['requestPeer'](_userId, _roomName)
		.then(blogs => res.status(200).json(blogs))
		.catch(error => res.status(400).json(error));
	}

	static getUserRoom(req: express.Request, res: express.Response):void {
		let _roomName = req.params.roomName;
		let _userId = req["user"]._id.toString();
		ChatsDAO
		['getUserRoom'](_userId, _roomName)
		.then(blogs => res.status(200).json(blogs))
		.catch(error => res.status(400).json(error));
	}

	static getSupportRooms(req: express.Request, res: express.Response):void {
		let _roomName = req.params.roomName;
		ChatsDAO
		['getSupportRooms'](_roomName)
		.then(blogs => res.status(200).json(blogs))
		.catch(error => res.status(400).json(error));
	}

	static getMembers(req: express.Request, res: express.Response):void {
		let _roomId = req.params.roomId;
		ChatsDAO
		['getMembers'](_roomId)
		.then(blogs => res.status(200).json(blogs))
		.catch(error => res.status(400).json(error));
	}

	static postMembers(req: express.Request, res: express.Response):void {
		let _roomId = req.params.roomId;
		let _memberId = req.params.memberId;
		ChatsDAO
		['postMembers'](_roomId, _memberId)
		.then(blogs => res.status(200).json(blogs))
		.catch(error => res.status(400).json(error));
	}
}