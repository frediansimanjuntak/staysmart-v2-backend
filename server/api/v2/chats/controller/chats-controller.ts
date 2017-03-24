import * as express from 'express';
import ChatsDAO from '../dao/chats-dao';

export class ChatsController {
	static requestToken(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id.toString();
		let _username = req["user"].username;
		ChatsDAO
		['requestToken'](_userId, _username)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static insertChatRoom(req: express.Request, res: express.Response):void {
		let _users = req.body.user;
		let _rooms = req.body.rooms;
		ChatsDAO
		['insertChatRoom'](_users, _rooms)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static createRoom(req: express.Request, res: express.Response):void {
		let _uid = req["user"]._id;
		let _name = req.body.name;
		ChatsDAO
		['createRoom'](_uid, _name)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static archivedRoom(req: express.Request, res: express.Response):void {
		let _roomId = req.params.roomId;
		ChatsDAO
		['archivedRoom'](_roomId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static requestPeer(req: express.Request, res: express.Response):void {
		let _roomName = req.params.roomName;
		let _userId = req["user"]._id.toString();
		ChatsDAO
		['requestPeer'](_userId, _roomName)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static getUserRoom(req: express.Request, res: express.Response):void {
		let _roomName = req.params.roomName;
		let _userId = req["user"]._id.toString();
		ChatsDAO
		['getUserRoom'](_userId, _roomName)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static getSupportRooms(req: express.Request, res: express.Response):void {
		let _roomName = req.params.roomName;
		ChatsDAO
		['getSupportRooms'](_roomName)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static getMembers(req: express.Request, res: express.Response):void {
		let _roomId = req.params.roomId;
		ChatsDAO
		['getMembers'](_roomId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static postMembers(req: express.Request, res: express.Response):void {
		let _roomId = req.params.roomId;
		let _memberId = req.params.memberId;
		ChatsDAO
		['postMembers'](_roomId, _memberId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static updateRoom(req: express.Request, res: express.Response):void {
		let _roomId = req.params.roomId;
		let _status = req.params.status;
		ChatsDAO
		['updateRoom'](_roomId, _status)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static updateProfile(req: express.Request, res: express.Response):void {
		let _data = req.body;
		ChatsDAO
		['updateProfile'](_data)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static postAnswer(req: express.Request, res: express.Response):void {
		let _option = req.params.option;
		let _id = req.params.id;
		let _uid = req["user"]._id;
		ChatsDAO
		['postAnswer'](_id, _uid, _option)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}
}