import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

export class amenityHelper{
	static getAll(amenities, headers) {
		return new Promise((resolve:Function, reject:Function) => {
			let header: any = headers;
			if (header.from && header.from == 'Mobile') {
				for(var i = 0; i < amenities.length; i++) {
					amenities[i].icon = amenities[i].icon.url;
				}
				resolve(amenities);
			}
			else {
				resolve(amenities);
			}
		});
	}
}