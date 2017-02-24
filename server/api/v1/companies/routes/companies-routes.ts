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
			.route('/companies/:id')
			.get(auth.isAuthenticated(),CompaniesController.getById)
			.put(auth.isAuthenticated(),CompaniesController.deleteCompanies);

		router
			.route('/companies/update/:id')
			.post(auth.isAuthenticated(),CompaniesController.updateCompanies);

		router
			.route('/companies/document/')
			.post(auth.isAuthenticated(),CompaniesController.createDocument);

		router
			.route('/companies/document/:id')
			.post(auth.isAuthenticated(),CompaniesController.deleteDocument);
	}
} 
