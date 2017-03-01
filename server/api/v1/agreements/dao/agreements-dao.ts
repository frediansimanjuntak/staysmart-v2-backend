import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import agreementsSchema from '../model/agreements-model';
import Users from '../../users/dao/users-dao';

agreementsSchema.static('getAll', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {};
		Agreements
			.find(_query)
			.exec((err, agreements) => {
				err ? reject(err)
				: resolve(agreements);
			});
	});
});

agreementsSchema.static('getById', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {

		Agreements
			.findById(id)
			.exec((err, agreements) => {
				err ? reject(err)
				: resolve(agreements);
			});
	});
});

agreementsSchema.static('createAgreements', (agreements:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		let body:any = agreements;

		var _agreements = new Agreements(agreements);
			_agreements.save((err, saved)=>{
				err ? reject(err)
				: resolve(saved);
			});
	});
});

agreementsSchema.static('createTA', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		let agreementObj = {$set: {}};
		for(var param in data) {
			if(param == 'status' || param == 'payment') {
				agreementObj.$set['tenancy_agreement.data.'+param] = data[param];
			}
			agreementObj.$set['tenancy_agreement.data.confirmation.landlord.'+param] = data[param];
		}
		Agreements
			.findByIdAndUpdate(id,agreementObj)
			.exec((err, updated) => {
				err ? reject(err)
				: resolve();
			});	
	});
});

agreementsSchema.static('updateTA', (id:string, data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(data)) {
			return reject(new TypeError('TA is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		var type = 'tenancy_agreement';
		let body:any = data;
		let agreementObj = {$set: {}};
		for(var param in data) {
			if(param == 'status' || param == 'payment') {
				agreementObj.$set['tenancy_agreement.data.'+param] = data[param];
			}
			agreementObj.$set['tenancy_agreement.data.confirmation.tenant.'+param] = data[param];
		}

		if(body.status = 'accepted') {
			Agreements
				.findById(id, (err, result) => {
					var propertyID = result.property;
					var landlordID = result.landlord;
					var date_start = result.letter_of_intent.data.date_commencement;
					var rent_time = result.letter_of_intent.data.term_lease;
					var extend_rent_time = result.letter_of_intent.data.term_lease_extend;
					var long_rent_time = rent_time + extend_rent_time;
					
					Users
						.findById(landlordID, {
							$push: {
								"rented_properties": {
									"until": new Date(+new Date() + long_rent_time*30*24*60*60*1000),
									"property": propertyID,
									"agreement": id
								}
							}
						})
						.exec((err, updated) => {
							err ? reject(err)
							: resolve();
						});	
				})
		}

		Agreements.createLOIandTAHistory(id, type);
		Agreements
			.findByIdAndUpdate(id,agreementObj)
			.exec((err, updated) => {
				err ? reject(err)
				: resolve();
			});	
	});
});

agreementsSchema.static('createLOIandTAHistory', (id:string, type:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        Agreements
          .findById(id, type, (err, result) => {
            var historyObj = {$push: {}};
            historyObj.$push[type+'.histories'] = {"date": Date.now, "data": result.data};
            Agreements
              .findByIdAndUpdate(id, historyObj)
              .exec((err, saved) => {
                err ? reject(err)
                : resolve(saved);
              });
          })
    });
});

agreementsSchema.static('deleteAgreements', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
			return reject(new TypeError('Id is not a valid string.'));
		}

		Agreements
			.findByIdAndRemove(id)
			.exec((err, deleted) => {
				err ? reject(err)
				: resolve();
			});

	});
});

agreementsSchema.static('updateAgreements', (id:string, agreements:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(agreements)) {
			return reject(new TypeError('Agreement is not a valid object.'));
		}

		Agreements
			.findByIdAndUpdate(id, agreements)
			.exec((err, updated) => {
				err ? reject(err)
				: resolve(updated);
			});
	});
});

let Agreements = mongoose.model('Agreements', agreementsSchema);

export default Agreements;