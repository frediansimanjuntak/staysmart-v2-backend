import * as express from 'express';
import FaqsDAO from '../dao/faqs-dao';
var passport = require('passport');

export class FaqsController {
	static getAll(req: express.Request, res: express.Response):void {
		FaqsDAO
		['getAll']()
		.then(faqs => res.status(200).json(faqs))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		FaqsDAO
		['getById'](_id)
		.then(faqs => res.status(200).json(faqs))
		.catch(error => res.status(400).json(error));
	}

	static createFaqs(req: express.Request, res: express.Response):void {
		let _faqs = req.body;
		FaqsDAO
		['createFaqs'](_faqs)
		.then(faqs => res.status(201).json(faqs))
		.catch(error => res.status(400).json(error));
	}

	static deleteFaqs(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		FaqsDAO
		['deleteFaqs'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}

	static updateFaqs(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		let _faqs = req.body;

		FaqsDAO
		['updateFaqs'](_id, _faqs)
		.then(faqs => res.status(201).json(faqs))
		.catch(error => res.status(400).json(error));
	}
}