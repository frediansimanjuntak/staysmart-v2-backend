"use strict";

import * as express from 'express';
import {CompaniesController} from '../controller/companies-controller';
import * as auth from '../../../../auth/auth-service';

export class CompaniesRoutes {
	static init(router: express.Router) {
		router
			.route('/companies')
			.get(auth.isAuthenticated(),CompaniesController.getAll)
			.post(auth.isAuthenticated(),CompaniesController.createCompanies);
		
		router
			.route('/company')
			.get(auth.isAuthenticated(),CompaniesController.getUserCompany);

		router
			.route('/companies/:id')
			.get(auth.isAuthenticated(),CompaniesController.getById)
			.delete(auth.isAuthenticated(),CompaniesController.deleteCompanies);

		router
			.route('/companies/update/:id')
			.put(auth.isAuthenticated(),CompaniesController.updateCompanies);
	}
} 
