import * as express from 'express';
import {reportDAO} from '../dao/report-dao';

export class ReportController{
	static reportLOI(req: express.Request, res: express.Response):void{
		let _id = req.params.id;

		reportDAO.reportLOI(_id)
		.then(report => res.status(200).json(report))
		.catch(error => res.status(400).json(error));
	}

	static reportTA(req: express.Request, res: express.Response):void{
		let _id = req.params.id;

		reportDAO.reportTA(_id)
		.then(report => res.status(200).json(report))
		.catch(error => res.status(400).json(error));
	}

	static printReport(req: express.Request, res: express.Response):void{
		let _data = req.body;
		let _id = req.params.id;

		reportDAO.printReport(_id, _data)
		.then(report => res.status(200).download(report))
		.catch(error => res.status(400).json(error));
	}		
}