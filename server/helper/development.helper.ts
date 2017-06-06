import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import {propertyHelper} from './property.helper';

export class developmentHelper{
	static getAll(developments) {
		return new Promise((resolve:Function, reject:Function) => {
			let dev = [];
			for(var i = 0; i < developments.length; i++) {
				dev.push({
					text: developments[i].name,
					id: developments[i]._id
				});
			}
			resolve(dev);
		});
	}

	static getById(developments, userId) {
		return new Promise((resolve:Function, reject:Function) => {
			propertyHelper.getAll(developments.properties, userId).then(res => {
				resolve({
					_id: developments._id,
					name: developments.name,
					number_of_units: developments.number_of_units,
					created_at: developments.created_at,
					tenure: developments.tenure,
					property_type: '',
					planing_region: developments.planning_region,
					planing_area: developments.planning_area,
					type_of_area: developments.type_of_area,
					description: developments.description,
					age: developments.age,
					units: res,	
				});
			});
		});
	}
}