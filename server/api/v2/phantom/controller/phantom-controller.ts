import * as express from 'express';
import {phantomDAO} from '../dao/phantom-dao';

export class PhantomController{
	static getHtml(req: express.Request, res: express.Response):void{
		let _query = req.query;
		phantomDAO.getHtml(_query)
		.then(phantom => res.status(200).json(phantom))
		.catch(error => res.status(400).json(error));
	}	
}