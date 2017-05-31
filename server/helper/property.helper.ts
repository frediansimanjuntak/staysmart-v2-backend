import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Users from '../api/v2/users/dao/users-dao';

export class propertyHelper{
	static getAll(properties, userId, headers) {
		return new Promise((resolve:Function, reject:Function) => {
			let header: any = headers;
			if (header.from && header.from == 'Mobile') {
				Users
					.findById(userId)
					.exec((err, user) => {
						if (err) {
							reject(err);
						}
						else {
							let favourite;
							let properties_data = [];
							for( var p = 0; p < properties.length; p++ ) {
								if (user.shortlisted_properties.length > 0) {
									let count = 0;
									for( var i = 0 ; i < user.shortlisted_properties.length; i++ ) {
										if ( properties[p]._id == user.shortlisted_properties[i] ) {
											count += 1;
										}
									}
									if (count > 0) {
										favourite = true;
									}
									else {
										favourite = false;
									}
									properties_data.push({
										_id: properties[p]._id,
										development: properties[p].development.name,
										user: {
											_id: userId,
											username: user.username,
											pictures: user.picture.url
										},
										address: {
											unit_no: properties[p].address.floor,
											unit_no_2: properties[p].address.unit, 
											block_no: properties[p].address.block_number,
											street_name: properties[p].address.street_name,
											postal_code: properties[p].address.postal_code,
											country: properties[p].address.country,
											type: properties[p].address.type,
											coordinates: properties[p].address.coordinates
										},
										pictures: properties[p].pictures,
										favourite: favourite,
										amenities: properties[p].amenities,
										details: {
											size: properties[p].details.size_sqf, 
											size_sqm: properties[p].details.size_sqm,
											bedroom: properties[p].details.bedroom,
											bathroom: properties[p].details.bathroom, 
											price: properties[p].details.price,
											psqft: properties[p].details.psqft,
											available: properties[p].details.available,
											furnishing: properties[p].details.furnishing,
											description: properties[p].details.description,
											type: properties[p].details.type
										},
										seen: properties[p].seen
									});
								}
								else {
									favourite = false;
									properties_data.push({
										_id: properties[p]._id,
										development: properties[p].development.name,
										user: {
											_id: userId,
											username: user.username,
											pictures: user.picture.url
										},
										address: {
											unit_no: properties[p].address.floor,
											unit_no_2: properties[p].address.unit, 
											block_no: properties[p].address.block_number,
											street_name: properties[p].address.street_name,
											postal_code: properties[p].address.postal_code,
											country: properties[p].address.country,
											type: properties[p].address.type,
											coordinates: properties[p].address.coordinates
										},
										pictures: properties[p].pictures,
										favourite: favourite,
										amenities: properties[p].amenities,
										details: {
											size: properties[p].details.size_sqf, 
											size_sqm: properties[p].details.size_sqm,
											bedroom: properties[p].details.bedroom,
											bathroom: properties[p].details.bathroom, 
											price: properties[p].details.price,
											psqft: properties[p].details.psqft,
											available: properties[p].details.available,
											furnishing: properties[p].details.furnishing,
											description: properties[p].details.description,
											type: properties[p].details.type
										},
										seen: properties[p].seen
									});
								}
							}
							resolve(properties_data);
						}
					})
			}
			else {
				resolve(properties);
			}
		});
	}
}