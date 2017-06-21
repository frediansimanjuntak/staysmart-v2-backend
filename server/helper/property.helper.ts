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
									if ( properties[p]._id != null && String(properties[p]._id) == String(user.shortlisted_properties[i]) ) {
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
									pictures: properties[p].owner.user ? properties[p].owner.user.picture ? properties[p].owner.user.picture.url : properties[p].owner.user.service ? properties[p].owner.user.service.facebook ? properties[p].owner.user.service.facebook.picture : '' : '' : '' 
								},
								address: {
									unit_no: properties[p].address.floor,
									unit_no_2: properties[p].address.unit, 
									block_no: properties[p].address.block_number,
									street_name: properties[p].address.street_name,
									postal_code: String(properties[p].address.postal_code),
									full_address: properties[p].address.full_address,
									country: properties[p].address.country,
									type: properties[p].address.type,
									coordinates: [Number(properties[p].address.coordinates[0]) , Number(properties[p].address.coordinates[1])]
								},
								pictures: properties[p].pictures,
								favourite: favourite,
								amenities: properties[p].amenities,
								details: {
									size: Number(properties[p].details.size_sqf),
									size_sqm: Number(properties[p].details.size_sqm),
									bedroom: Number(properties[p].details.bedroom),
									bathroom: Number(properties[p].details.bathroom),
									price: Number(properties[p].details.price),
									psqft: Number(properties[p].details.psqft),
									psqm: Number(properties[p].details.psqm),
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

	static getById(properties, userId, cased) {
		return new Promise((resolve:Function, reject:Function) => {
			let picture = [];
			for (var l = 0; l < properties.pictures.living.length; l++) {
				cased == 'step4' ? picture.push(properties.pictures.living[l].url) : properties.pictures.living[l] = properties.pictures.living[l].url ;
			}
			for (var d = 0; d < properties.pictures.dining.length; d++) {
				cased == 'step4' ? picture.push(properties.pictures.dining[d].url) : properties.pictures.dining[d] = properties.pictures.dining[d].url;
			}

			for (var b = 0; b < properties.pictures.bed.length; b++) {
				cased == 'step4' ? picture.push(properties.pictures.bed[b].url) : properties.pictures.bed[b] = properties.pictures.bed[b].url;
			}

			for (var t = 0; t < properties.pictures.toilet.length; t++) {
				cased == 'step4' ? picture.push(properties.pictures.toilet[t].url) : properties.pictures.toilet[t] = properties.pictures.toilet[t].url;
			}

			for (var k = 0; k < properties.pictures.kitchen.length; k++) {
				cased == 'step4' ? picture.push(properties.pictures.kitchen[k].url) : properties.pictures.kitchen[k] = properties.pictures.kitchen[k].url;
			}
			let _amenities = [];
			for ( var x = 0; x < properties.amenities.length; x++ ) {
				let id = properties.amenities[x]._id;
				let name = properties.amenities[x].name;
				let icon;
				if ( properties.amenities[x].icon == null ) {
					icon = '';
				}
				else {
					icon = properties.amenities[x].icon.url;
				}
				_amenities.push({
					_id: id,
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
						if ( rooms[r].tenant && rooms[r].property && properties._id && String(rooms[r].tenant) == String(userId) && String(rooms[r].property) == String(properties._id) ) {
							room = {
								tenantUser: rooms[r].tenant,
								landlordUser: rooms[r].landlord,
								property: rooms[r].property,
								manager: rooms[r].manager,
								roomId: rooms[r]._id
							};
						}
					}
					let favourite;
					if (user.shortlisted_properties.length > 0) {
						let count = 0;
						for ( var i = 0 ; i < user.shortlisted_properties.length; i++ ) {
							if ( properties._id && String(properties._id) == String(user.shortlisted_properties[i]) ) {
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
					resolve({
						_id: properties._id,
						development: properties.development.name,
						landlord: {
							_id: properties.owner.user._id,
							full_name: properties.owner.user.landlord.data ? properties.owner.user.landlord.data.name ? properties.owner.user.landlord.data.name : properties.temp.owner.name : ''
						},
						user: {
							_id: properties.owner.user._id,
							username: properties.owner.user.username,
							pictures: properties.owner.user.picture ? properties.owner.user.picture.url : properties.owner.user.service ? properties.owner.user.service.facebook ? properties.owner.user.service.facebook.picture : '' : ''
						},
						address: {
							unit_no: properties.address.floor,
							unit_no_2: properties.address.unit,
							block_no: properties.address.block_number,
							street_name: properties.address.street_name,
							postal_code: String(properties.address.postal_code),
							coordinates: [Number(properties.address.coordinates[0]) , Number(properties.address.coordinates[1])],
							country: properties.address.country,
							full_address: properties.address.full_address ? properties.address.full_address : '',
							type: properties.address.type
						},
						details: {
							size: Number(properties.details.size_sqf),
							size_sqm: Number(properties.details.size_sqm),
							bedroom: Number(properties.details.bedroom),
							bathroom: Number(properties.details.bathroom),
							price: Number(properties.details.price),
							psqft: Number(properties.details.psqft),
							available: properties.details.available,
							furnishing: properties.details.furnishing,
							description: properties.details.description,
							type: properties.details.type ? properties.details.type : ''
						},
						seen: {
							by: properties.seen.by,
							counts: properties.seen.by.length
						},
						favourite: favourite,
						amenities: _amenities,
						pictures: cased == 'step4' ? picture : properties.pictures,
						room: room
					});
				}
			})
		});
	}
}