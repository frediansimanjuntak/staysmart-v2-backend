"use strict";

import * as express from 'express';
import {ChatsController} from '../controller/chats-controller';
import * as auth from '../../../../auth/auth-service';

export class ChatsRoutes {
	static init(router: express.Router) {
		router
			.route('/chats')
			.get(auth.isAuthenticated(),ChatsController.getAll);

		router
			.route('/chats/users')
			.get(auth.isAuthenticated(),ChatsController.getByUser);

		router
			.route('/chats/request_token')
			.get(auth.isAuthenticated(),ChatsController.requestToken)

		router
			.route('/chats/request_peer/:roomName')
			.get(auth.isAuthenticated(),ChatsController.requestPeer)

		router
			.route('/chats/users/room/:roomName')
			.get(auth.isAuthenticated(),ChatsController.getUserRoom)

		router
			.route('/chats/support/room/:roomName')
			.get(auth.isAuthenticated(),ChatsController.getSupportRooms)

		router
			.route('/chats/rooms/member/:roomId')
			.get(auth.isAuthenticated(),ChatsController.getMembers)

		router
			.route('/chats/rooms/member/:roomId/:memberId')
			.get(auth.isAuthenticated(),ChatsController.postMembers)

		router
			.route('/chats/rooms/insert')
			.post(auth.isAuthenticated(),ChatsController.insertChatRoom)

		router
			.route('/chats/room/create')
			.post(auth.isAuthenticated(),ChatsController.createRoom)

		router
			.route('/chats/rooms/delete_many')
			.post(auth.isAuthenticated(),ChatsController.deleteRoomMany)

		router
			.route('/chats/rooms/delete/:roomId')
			.delete(auth.isAuthenticated(),ChatsController.deleteRoom)

		router
			.route('/chats/room/archived/:roomId')
			.post(auth.isAuthenticated(),ChatsController.archivedRoom)

		router
			.route('/chats/rooms/update/:roomId/:status')
			.put(auth.isAuthenticated(),ChatsController.updateRoom)

		router
			.route('/chats/profile/update')
			.put(auth.isAuthenticated(),ChatsController.updateProfile)

		router
			.route('/chats/answer/:id/:option')
			.post(auth.isAuthenticated(),ChatsController.postAnswer)
	}
}
