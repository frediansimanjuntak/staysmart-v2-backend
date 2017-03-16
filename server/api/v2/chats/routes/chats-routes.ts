"use strict";

import * as express from 'express';
import {ChatsController} from '../controller/chats-controller';
import * as auth from '../../../../auth/auth-service';

export class ChatsRoutes {
	static init(router: express.Router) {
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
	}
}
