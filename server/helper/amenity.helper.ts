import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

export class amenityHelper{
	static getAll(amenities) {
		return new Promise((resolve:Function, reject:Function) => {
			let amenity = [];
			for(var i = 0; i < amenities.length; i++) {
				amenity.push({
					_id: amenities[i]._id,
					name: amenities[i].name,
					description: amenities[i].description,
					created_at: amenities[i].created_at,
					icon: amenities[i].icon.url
				});
			}
			resolve(amenity);
		});
	}
}