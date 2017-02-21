"use strict";

import * as express from 'express';
import {CompaniesController} from '../controller/companies-controller';

export class CompaniesRoutes {
	static init(router: express.Router) {
		router
			.route('/companies')
			.get(CompaniesController.getAll)
			.post(CompaniesController.createCompanies);

		router
			.route('/companies/:id')
			.get(CompaniesController.getById)
			.put(CompaniesController.deleteCompanies);

		router
			.route('/companies/update/:id')
			.post(CompaniesController.updateCompanies);
	}
} 
