import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Subscribes from '../api/v2/subscribe/dao/subscribes-dao';

export class categoryHelper{
	static getAll(categories) {
		return new Promise((resolve:Function, reject:Function) => {
			let categories_data = [];
			for(var i = 0; i < categories.length; i++) {
				categories_data.push({
                    _id: categories[i]._id,
                    name: categories[i].name,
                    description: categories[i].description,
                    created_at: categories[i].created_at,
                    created_by: categories[i].created_by._id
                });
			}
			resolve(categories_data);
		});
	}
}