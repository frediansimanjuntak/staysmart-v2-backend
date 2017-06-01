import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

export class developmentHelper{
	static getAll(developments, headers) {
		return new Promise((resolve:Function, reject:Function) => {
			let header: any = headers;
			if (header.from && header.from == 'Mobile') {
				let dev = [];
				for(var i = 0; i < developments.length; i++) {
					dev.push({
						text: developments[i].name,
						id: developments[i]._id
					});
				}
				resolve(dev);
			}
			else {
				resolve(developments);
			}
		});
	}
}