import * as express from 'express';
import {reportDAO} from '../dao/report-dao';

export class ReportController{
	static reportLOI(req: express.Request, res: express.Response):void{
		let _id = req.params.id;

		reportDAO.reportLOI(_id)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}

	static reportTA(req: express.Request, res: express.Response):void{
		let _id = req.params.id;

		reportDAO.reportTA(_id)
		.then(agreements => res.status(200).json(agreements))
		.catch(error => res.status(400).json(error));
	}	
}