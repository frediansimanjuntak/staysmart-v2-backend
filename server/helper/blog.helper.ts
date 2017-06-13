import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import Subscribes from '../api/v2/subscribe/dao/subscribes-dao';

export class blogHelper{
	static getAll(blogs) {
		return new Promise((resolve:Function, reject:Function) => {
			Subscribes.find({"extra.type": "blog"}).exec((err, subscribe) => {
				if (err) { reject({message: err.message}); }
				else {
					let blogs_data = [];
					for(var i = 0; i < blogs.length; i++) {
						let subscribes = [];
						for (var j = 0; j < subscribe.length; j++) {
							if (String(subscribe[j].extra.reference_id) == String(blogs[i]._id)) {
								subscribes.push(subscribe[j].email);
							}
						}
						blogs_data.push({
							_id: blogs[i]._id,
							title: blogs[i].title,
							source: blogs[i].source,
							content: blogs[i].content,
							category: blogs[i].category,
							cover: blogs[i].cover.url,
							created_at: blogs[i].created_at,
							created_by: blogs[i].created_by,
							subscribe: subscribes
						});
					}
					resolve(blogs_data);
				}
			});
		});
	}

	static getById(blogs, userEmail) {
		return new Promise((resolve:Function, reject:Function) => {
			Subscribes.find({"extra.type": "blog", "extra.reference_id": blogs._id}).exec((err, subscribe) => {
				if (err) { reject({message: err.message}); }
				else {
					let subscribes = [];
					for (var i = 0; i < subscribe.length; i++) {
						subscribes.push(subscribe[i].email);
					}
					resolve({
						_id: blogs._id,
						title: blogs.title,
						content: blogs.content,
						category: blogs.category,
						cover: blogs.cover.url,
						created_at: blogs.created_at,
						created_by: blogs.created_by,
						comment: blogs.comments,
						subscribe: subscribes
					});
				}
			});
		});
	}

	static getSubscribeBlog(blogs) {
		return new Promise((resolve:Function, reject:Function) => {
			Subscribes
				.find({"extra.type": "blog", "extra.reference_id": blogs._id})
				.select("email")
				.exec((err, result) => {
					if (err) {
						reject(err);
					}
					else {
						let email = [];
						for (var i = 0; i < result.length; i++) {
							email.push(result[i].email);
						}
						resolve({
							_id: blogs._id,
							title: blogs.title,
							content: blogs.content,
							category: blogs.category,
							cover: blogs.cover.url,
							created_at: blogs.created_at,
							created_by: blogs.created_by,
							source: blogs.source,
							subscribe: email
						});
					}
				})
		});
	}
}