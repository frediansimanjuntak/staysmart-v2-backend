import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import subscribesSchema from '../model/subscribes-model';

subscribesSchema.static('getAll', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {};

		Subscribes
			.find(_query)
			.exec((err, subscribes) => {
				err ? reject(err)
				: resolve(subscribes);
			});
	});
});

subscribesSchema.static('getById', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

		Subscribes
			.findById(id)
			.exec((err, subscribes) => {
				err ? reject(err)
					: resolve(subscribes);
			});
	});
});

subscribesSchema.static('createSubscribes', (subscribes:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(subscribes)) {
			return reject(new TypeError('Subscribes is not a valid object.'));
		}
		let body:any = subscribes;
		Subscribes
			.find({"email": body.email})
			.exec((err, res) => {
				if(err){
					reject(err);
				}
				if(res){
					if(res.length >= 1){
						resolve({message: "your email already added to subscribe"})
					}
					if(res.length < 1){
						var _subscribes = new Subscribes(subscribes);
						_subscribes.save((err, saved)=>{
							err ? reject(err)
								: resolve(subscribes);
						})
					}
				}
			})			
	});
});

subscribesSchema.static('unSubscribes', (subscribes:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(subscribes)) {
			return reject(new TypeError('Subscribes is not a valid object.'));
		}
		let body:any = subscribes;
		Subscribes
			.find({"email": body.email})
			.exec((err, res) => {
				if(err){
					reject(err);
				}
				if(res){
					if(res.length >= 1){
						_.each(res, (result) => {
							let id = result._id;
							Subscribes
						      .findByIdAndRemove(id)
						      .exec((err, deleted) => {
						          err ? reject(err)
						              : resolve({message:"unsubscribe success"});
						      });
						})												
					}
					if(res.length < 1){
						resolve({message: "This email is not registered"})
					}
				}
			})		
	});
});

subscribesSchema.static('deleteSubscribes', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

		Subscribes
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve({message:"delete success"});
          });
	});
});

subscribesSchema.static('deleteManySubscribes', (data:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = data;
        for(var i = 0; i < body.ids.length; i++){
        	let id = body.ids[i];
        	Subscribes
		      .findByIdAndRemove(id)
		      .exec((err, deleted) => {
		          err ? reject(err)
		              : resolve({message:"delete success"});
		      });
        }		
	});
});


let Subscribes = mongoose.model('Subscribes', subscribesSchema);

export default Subscribes;