import * as express from 'express';
import PaymentsDAO from '../dao/payments-dao';

export class PaymentsController{
	static getAll(req: express.Request, res: express.Response):void {
      PaymentsDAO
        ['getAll']()
        .then(payments => res.status(200).json(payments))
        .catch(error => res.status(400).json(error));
  	}

  	static getById(req: express.Request, res: express.Response):void {
      let _id = req.params.id;

      PaymentsDAO
        ['getById'](_id)
        .then(payments => res.status(200).json(payments))
        .catch(error => res.status(400).json(error));
  	}

    static createPayment(req: express.Request, res: express.Response):void {
      let _payment = req.body;

      PaymentsDAO
        ['createPayment'](_payment)
        .then(payment => res.status(201).json(payment))
        .catch(error => res.status(400).json(error));
    }

    static deletePayment(req: express.Request, res: express.Response):void {
      let _id = req.params.id;

      PaymentsDAO
        ['deletePayment'](_id)
        .then(() => res.status(200).json())
        .catch(error => res.status(400).json(error));
    }

    static updatePayment(req: express.Request, res: express.Response):void {
      let _id = req.params.id;
      let _payment = req.body;

      PaymentsDAO
        ['updatePayment'](_id, _payment)
        .then(payment => res.status(201).json(payment))
        .catch(error => res.status(400).json(error));
    }
} 