"use strict";

import * as express from 'express';
import {ReportController} from '../controller/report-controller';
import * as auth from '../../../../auth/auth-service';

export class ReportRoutes{
	static init(router: express.Router){
		router
			.route('/report/loi/:id/')
			.get(ReportController.reportLOI);

		router
			.route('/report/ta/:id/')
			.get(ReportController.reportTA);

		router
			.route('/report/print/')
			.post(ReportController.printReport);
	}
}