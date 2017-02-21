import * as express from 'express';
import PaymentsDAO from '../dao/payments-dao';

export class PaymentsController {
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

  static createPayments(req: express.Request, res: express.Response):void {
    let _payments = req.body;
    PaymentsDAO
    ['createPayments'](_payments)
    .then(payments => res.status(201).json(payments))
    .catch(error => res.status(400).json(error));
  }

  static deletePayments(req: express.Request, res: express.Response):void {
    let _id = req.params.id;
    PaymentsDAO
    ['deletePayments'](_id)
    .then(() => res.status(200).end())
    .catch(error => res.status(400).json(error));
  }

  static updatePayments(req: express.Request, res: express.Response):void {
    let _id = req.params.id;
    let _payments = req.body;

    PaymentsDAO
    ['updatePayments'](_id, _payments)
    .then(payments => res.status(201).json(payments))
    .catch(error => res.status(400).json(error));
  }
}