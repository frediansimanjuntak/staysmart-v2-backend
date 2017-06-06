import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

export class amenityHelper{
	static getAll(amenities) {
		return new Promise((resolve:Function, reject:Function) => {
			for(var i = 0; i < amenities.length; i++) {
				amenities[i].icon = amenities[i].icon.url;
			}
			resolve(amenities);
		});
	}
}