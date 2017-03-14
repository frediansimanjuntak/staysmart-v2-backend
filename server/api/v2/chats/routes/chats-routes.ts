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
			.route('/chats/rooms/insert')
			.post(auth.isAuthenticated(),ChatsController.insertChatRoom)
	}
}
