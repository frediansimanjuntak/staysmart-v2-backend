import * as express from 'express';
import ChatsDAO from '../dao/chats-dao';

export class ChatsController {
	static getAll(req: express.Request, res: express.Response):void {

		ChatsDAO
		['getAll']()
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _userId = req["user"]._id;

		ChatsDAO
		['getById'](_id, _userId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static getByRoomId(req: express.Request, res: express.Response):void {
		let _id = req.params.id;

		ChatsDAO
		['getByRoomId'](_id)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static getByUser(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id.toString();
		ChatsDAO
		['getByUser'](_userId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static requestToken(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id.toString();
		let _username = req["user"].username;
		ChatsDAO
		['requestToken'](_userId, _username)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}
	
	static updateUserDt(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id.toString();
		let _body = req.body;
		ChatsDAO
		['updateUserDt'](_userId, _body)
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
		let _data = req.body;
		let _device = req.device.type;
		ChatsDAO
		['createRoom'](_uid, _data, _device)
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

	static updateRoomMobile(req: express.Request, res: express.Response):void {
		let _data = req.body;
		ChatsDAO
		['updateRoomMobile'](_data)
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

	static deleteRoom(req: express.Request, res: express.Response):void {
		let _roomId = req.params.roomId;
		let _userId = req["user"]._id
		ChatsDAO
		['deleteRoom'](_roomId, _userId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static removeRoomMobile(req: express.Request, res: express.Response):void {
		let _data = req.body;
		ChatsDAO
		['removeRoomMobile'](_data)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static deleteRoomMany(req: express.Request, res: express.Response):void {
		let _roomId = req.body;
		let _roleId = req["user"].role;
		ChatsDAO
		['deleteRoomMany'](_roomId, _roleId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static getAllUserRooms(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		ChatsDAO
		['getAllUserRooms'](_userId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static getUserRoomById(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _roomId = req.params.room_id;
		ChatsDAO
		['getUserRoomById'](_roomId, _userId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}

	static getUserRoomByScheduleId(req: express.Request, res: express.Response):void {
		let _userId = req["user"]._id;
		let _scheduleId = req.params.schedule_id;
		ChatsDAO
		['getUserRoomByScheduleId'](_scheduleId, _userId)
		.then(chats => res.status(200).json(chats))
		.catch(error => res.status(400).json(error));
	}
}