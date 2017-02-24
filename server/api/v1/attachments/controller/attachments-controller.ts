import * as express from 'express';
import AttachmentsDAO from '../dao/attachments-dao';

export class AttachmentsController {
	static getAll(req: express.Request, res: express.Response):void {
		AttachmentsDAO
		['getAll']()
		.then(attachments => res.status(200).json(attachments))
		.catch(error => res.status(400).json(error));
	}

	static getById(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		AttachmentsDAO
		['getById'](_id)
		.then(attachments => res.status(200).json(attachments))
		.catch(error => res.status(400).json(error));
	}

	static createAttachments(req: express.Request, res: express.Response):void {
		let _attachments = req["files"].attachment;
		AttachmentsDAO
		['createAttachments'](_attachments)
		.then(attachments => res.status(201).json(attachments))
		.catch(error => res.status(400).json(error));
	}

	static deleteAttachments(req: express.Request, res: express.Response):void {
		let _id = req.params.id;
		AttachmentsDAO
		['deleteAttachments'](_id)
		.then(() => res.status(200).end())
		.catch(error => res.status(400).json(error));
	}
}