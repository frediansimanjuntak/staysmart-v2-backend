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
					let comments = [];
					for (var j = 0; j < blogs.comments.length; j++) {
						let replies = [];

						for (var k = 0; k < blogs.comments[j].replies.length; k++) {
							let reply = blogs.comments[j].replies[k];

							replies.push({
								_id: reply._id,
								name: reply.name,
								email: reply.email,
								comment: reply.content,
								type_comment: reply.type == 'comment/' ? 'blog' : reply.type == 'reply/' ? 'comment' : reply.type,
								blog: reply.blog,
								created_at: reply.created_at
							});
						}
						let user;
						if (blogs.comments[j].user) {
							user = {
										_id: blogs.comments[j].user._id,
										username: blogs.comments[j].user.username,
										role : blogs.comments[j].user.role,
										emails: [
											{
												address: blogs.comments[j].user.email,
												verified: blogs.comments[j].user.verification.verified
											}
										],
										picture: blogs.comments[j].user.picture ? blogs.comments[j].user.picture.url : blogs.comments[j].user.service ? blogs.comments[j].user.service.facebook ? blogs.comments[j].user.service.facebook.picture : '' : ''
									};
						}
						else {
							user = {};
						}
						comments.push({
							_id: blogs.comments[j]._id,
							name: blogs.comments[j].name,
							email: blogs.comments[j].email,
							comment: blogs.comments[j].content,
							type_comment: blogs.comments[j].type == 'comment/' ? 'blog' : blogs.comments[j].type == 'reply/' ? 'comment' : blogs.comments[j].type,
							blog: blogs.comments[j].blog,
							user_id: blogs.comments[j].user ? blogs.comments[j].user._id : '',
							created_at: blogs.comments[j].created_at,
							user: user,
							reply: replies
						});
					}
					resolve({
						_id: blogs._id,
						cover: blogs.cover ? blogs.cover.url : '',
						title: blogs.title,
						content: blogs.content,
						created_at: blogs.created_at,
						created_by: blogs.created_by ? blogs.created_by._id : '',
						source: blogs.source ? blogs.source : '',
						subscribe: subscribes,
						comment: comments						
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