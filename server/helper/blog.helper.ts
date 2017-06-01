import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Subscribes from '../api/v2/subscribe/dao/subscribes-dao';

export class blogHelper{
	static getAll(blogs, headers) {
		return new Promise((resolve:Function, reject:Function) => {
			let header: any = headers;
			if (header.from && header.from == 'Mobile') {
				let blogs_data = [];
				for(var i = 0; i < blogs.length; i++) {
					blogs[i].cover = blogs[i].cover.url;
					blogs_data.push({
						_id: blogs[i]._id,
						title: blogs[i].title,
						content: blogs[i].content,
						category: blogs[i].category,
						cover: blogs[i].cover,
						created_at: blogs[i].created_at,
						created_by: blogs[i].created_by
					});
				}
				resolve(blogs_data);
			}
			else {
				resolve(blogs);
			}
		});
	}

	static getById(blogs, userEmail, headers) {
		return new Promise((resolve:Function, reject:Function) => {
			let header: any = headers;
			if (header.from && header.from == 'Mobile') {
				blogs.cover = blogs.cover.url;
				Subscribe
					.find({"email": userEmail, "extra.type":"blog", "extra.reference_id": blogs._id}).
					.exec((err, result) => {
						if (err) {
							reject(err);
						}
						else {
							if (result.length == 0) {
								subscribe = false;
							}
							else {
								subscribe = true;
							}
							resolve({
								_id: blogs._id,
								title: blogs.title,
								content: blogs.content,
								category: blogs.category,
								cover: blogs.cover,
								created_at: blogs.created_at,
								created_by: blogs.created_by,
								comment: blogs.comments,
								subscribe: subscribe
							});
						}
					})
			}
			else {
				resolve(blogs);
			}
		});
	}
}