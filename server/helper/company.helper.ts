import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

export class companyHelper{
	static getAll(companies) {
		return new Promise((resolve:Function, reject:Function) => {
            let company_data = [];
            for ( var i = 0; i < companies.length; i++ ) {
                let documents = companies[i].documents;
                for ( var j = 0; j < documents.length; j++ ) {
                    documents[j] = documents[j].url;
                }
                let shareholders = companies[i].shareholders;
                let shareholder = [];
                for ( var k = 0; k < shareholders.length; k++ ) {
                    shareholder.push({
                        full_name: shareholders[k].name,
                        type2: shareholders[k].identification_type,
                        id_number: shareholders[k].identification_number,
                        identity_front: shareholders[k].identification_proof.front.url
                    });
                }
                company_data.push({
                    _id: companies[i]._id,
                    name: companies[i].name,
                    company_number: companies[i].registration_number,
                    company_document: documents,
                    shareholder: shareholder,
                    landlord: {
                        _id: companies[i].created_by._id,
                        full_name: companies[i].created_by.landlord.data.name,
                        id_number: companies[i].created_by.landlord.data.identification_number,
                        identity_front: companies[i].created_by.landlord.data.identification_proof.front.url,
                        type: companies[i].created_by.landlord.data.identification_type,
                        user: companies[i].created_by._id
                    },
                    created_at: companies[i].created_at
                });
            }
            resolve(company_data);
        });
    }
}