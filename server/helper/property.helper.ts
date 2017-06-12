import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Users from '../api/v2/users/dao/users-dao';

export class propertyHelper{
	static getAll(properties, userId) {
		return new Promise((resolve:Function, reject:Function) => {
			Users
				.findById(userId)
				.exec((err, user) => {
					if (err) {
						reject(err);
					}
					else {
						let favourite;
						let properties_data = [];
						for ( var p = 0; p < properties.length; p++ ) {
							if (user.shortlisted_properties.length > 0) {
								let count = 0;
								for ( var i = 0 ; i < user.shortlisted_properties.length; i++ ) {
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
							}
							else {
								favourite = false;
								
							}

							for (var l = 0; l < properties[p].pictures.living.length; l++) {
								properties[p].pictures.living[l] = properties[p].pictures.living[l].url;
							}

							for (var d = 0; d < properties[p].pictures.dining.length; d++) {
								properties[p].pictures.dining[d] = properties[p].pictures.dining[d].url;
							}

							for (var b = 0; b < properties[p].pictures.bed.length; b++) {
								properties[p].pictures.bed[b] = properties[p].pictures.bed[b].url;
							}

							for (var t = 0; t < properties[p].pictures.toilet.length; t++) {
								properties[p].pictures.toilet[t] = properties[p].pictures.toilet[t].url;
							}

							for (var k = 0; k < properties[p].pictures.kitchen.length; k++) {
								properties[p].pictures.kitchen[k] = properties[p].pictures.kitchen[k].url;
							}

							properties_data.push({
								_id: properties[p]._id,
								development: properties[p].development.name,
								user: {
									_id: properties[p].owner.user ? properties[p].owner.user._id : '',
									username: properties[p].owner.user ? properties[p].owner.user.username : '',
									pictures: properties[p].owner.user ? properties[p].owner.user.picture ? properties[p].owner.user.picture.url : '' : '' 
								},
								address: {
									unit_no: properties[p].address.floor,
									unit_no_2: properties[p].address.unit, 
									block_no: properties[p].address.block_number,
									street_name: properties[p].address.street_name,
									postal_code: properties[p].address.postal_code,
									full_address: properties[p].address.full_address,
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
									psqm: properties[p].details.psqm,
									available: properties[p].details.available,
									furnishing: properties[p].details.furnishing,
									description: properties[p].details.description,
									type: properties[p].details.type,
									completion_date: properties[p].details.completion_date,
									planning_region: properties[p].details.planning_region,
									planning_area: properties[p].details.planning_area,
									type_of_sale: properties[p].details.type_of_sale,
									purchaser_address_indicator: properties[p].details.purchaser_address_indicator,
									sale_date: properties[p].details.sale_date,
									property_type: properties[p].details.property_type
								},
								seen: {
									by: properties[p].seen.by,
									counts: properties[p].seen.by.length
								}
							});
						}
						resolve(properties_data);
					}
				})
		});
	}

	static getById(properties, userId) {
		return new Promise((resolve:Function, reject:Function) => {
			for (var l = 0; l < properties.pictures.living.length; l++) {
				properties.pictures.living[l] = properties.pictures.living[l].url;
			}

			for (var d = 0; d < properties.pictures.dining.length; d++) {
				properties.pictures.dining[d] = properties.pictures.dining[d].url;
			}

			for (var b = 0; b < properties.pictures.bed.length; b++) {
				properties.pictures.bed[b] = properties.pictures.bed[b].url;
			}

			for (var t = 0; t < properties.pictures.toilet.length; t++) {
				properties.pictures.toilet[t] = properties.pictures.toilet[t].url;
			}

			for (var k = 0; k < properties.pictures.kitchen.length; k++) {
				properties.pictures.kitchen[k] = properties.pictures.kitchen[k].url;
			}
			let _amenities = [];
			for ( var x = 0; x < properties.amenities.length; x++ ) {
				let name = properties.amenities[x].name;
				let icon;
				if ( properties.amenities[x].icon == null ) {
					icon = '';
				}
				else {
					icon = properties.amenities[x].icon.url;
				}
				_amenities.push({
					name: name,
					url: icon
				});
			}
			var ObjectID = mongoose.Types.ObjectId;  
			Users.findById(userId).exec((err, user) => {
				if (err) {
					reject({message: err.message});
				}
				else {
					let rooms = user.chat_rooms;
					let room = {};
					for ( var r = 0; r < rooms.length; r++ ) {
						if ( rooms[r].tenant == userId && rooms[r].property == properties._id ) {
							room = {
								tenantUser: rooms[r].tenant,
								landlordUser: rooms[r].landlord,
								property: rooms[r].property,
								manager: rooms[r].manager,
								roomId: rooms[r]._id
							};
						}
					}
					resolve({
						_id: properties._id,
						development: properties.development.name,
						landlord: {
							_id: '',
							full_name: properties.owner.user.landlord.data.name
						},
						user: {
							_id: properties.owner.user._id,
							username: properties.owner.user.username,
							pictures: properties.owner.user.picture ? properties.owner.user.picture.url : ''
						},
						address: {
							unit_no: properties.address.floor,
							unit_no_2: properties.address.unit,
							block_no: properties.address.block_number,
							street_name: properties.address.street_name,
							postal_code: properties.address.postal_code,
							coordinates: properties.address.coordinates,
							country: properties.address.country,
							full_address: properties.address.full_address,
							type: properties.address.type
						},
						details: {
							size: properties.details.size_sqf,
							size_sqm: properties.details.size_sqm,
							bedroom: properties.details.bedroom,
							bathroom: properties.details.bathroom,
							price: properties.details.price,
							psqft: properties.details.psqft,
							available: properties.details.available,
							furnishing: properties.details.furnishing,
							description: properties.details.description,
							type: properties.details.type
						},
						seen: {
							by: properties.seen.by,
							counts: properties.seen.by.length
						},
						amenities: _amenities,
						pictures: properties.pictures,
						room: room
					});
				}
			})
		});
	}
}