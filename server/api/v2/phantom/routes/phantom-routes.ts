"use strict";

import * as express from 'express';
import {PhantomController} from '../controller/phantom-controller';
import * as auth from '../../../../auth/auth-service';

export class PhantomRoutes{
	static init(router: express.Router){	
		router
			.route('/phantom')
			.get(PhantomController.getHtml);
	}
}