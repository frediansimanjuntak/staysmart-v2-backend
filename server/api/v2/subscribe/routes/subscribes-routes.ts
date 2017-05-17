"use strict";

import * as express from 'express';
import {SubscribesController} from '../controller/subscribes-controller';
import * as auth from '../../../../auth/auth-service';

export class SubscribesRoutes {
	static init(router: express.Router) {
		router
			.route('/subscribes')
			.get(SubscribesController.getAll)
			.post(SubscribesController.createSubscribes);		

		router
			.route('/subscribes/:id')
			.get(SubscribesController.getById)
			.delete(SubscribesController.deleteSubscribes);

		router
			.route('/subscribes/delete_many')
			.post(SubscribesController.deleteManySubscribes);

		router
			.route('/unsubscribes')
			.post(SubscribesController.unSubscribes);
	}
}