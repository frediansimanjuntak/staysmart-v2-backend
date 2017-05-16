import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import commentsSchema from '../model/comments-model';
import Blogs from '../../blogs/dao/blogs-dao';
import Subscribes from '../../subscribe/dao/subscribes-dao';
import Users from '../../users/dao/users-dao';
import {mail} from '../../../../email/mail';
import config from '../../../../config/environment/index';

commentsSchema.static('getAll', ():Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let _query = {};

		Comments
			.find(_query)
			.populate("blog replies")
			.populate({
				path: 'user',
				populate: {
					path: 'picture',
					model: 'Attachments'
				},
				select: 'username picture'
			})
			.exec((err, comments) => {
				err ? reject({message: err.message})
				: resolve(comments);
			});
	});
});

commentsSchema.static('getById', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {

		Comments
			.findById(id)
			.populate("blog replies")
			.populate({
				path: 'user',
				populate: {
					path: 'picture',
					model: 'Attachments'
				},
				select: 'username picture'
			})
			.exec((err, comments) => {
				err ? reject({message: err.message})
					: resolve(comments);
			});
	});
});

commentsSchema.static('unSubscribeBlog', (blogObject:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		let body:any = blogObject;
		if(body.blog_id){
			Subscribes.unSubscribes(blogObject).then((res) => {
				resolve(res);
			})
			.catch((err) => {
				reject(err);
			})
		}
		else if(body.comment_id){
			Comments
				.update({"_id": body.comment_id}, {
					$set: {
						"subscribes": false
					}
				})
				.exec((err, updated) => {
					err ? reject({message: err.message})
						: resolve(updated);
				})
		}
	});
});

commentsSchema.static('sendSubscribeBlog', (idBlog:string, email:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Subscribes
			.find({"extra.reference_id": idBlog})
			.exec((err, subs) => {
				if(err){
					reject(err);
				}
				if(subs){
					_.each(subs, (result) => {
						let blog = result.extra.reference_id;
						Blogs
							.findById(blog)
							.exec((err, res) => {
								if(err){
									reject(err);
								}
								if(res){
									let blogTitle = res.blog.title;
									let blogSlug = res.blog.slug;
									let email = res.email;
									let name = res.name;
									var url = config.url.blog + blogSlug;
									mail.blogSubscribe(email, name, blogTitle, url).then(send => {
										resolve({message: "email sent"});
									})
									.catch(err => {
										reject(err);
									});	
								}
							})											
					})
				}
			})			
	});
});

commentsSchema.static('sendSubscribeComment', (idBlog:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Comments
			.find({"blog": idBlog, "subscribes": true, "type": "comment/"})
			.populate("blog")	
			.exec((err, com) => {
				if(err){
					reject(err);
				}
				if(com){
					if(com.length == 0){
						resolve({message: "no data"});
					}
					if(com.length >= 0){
						_.each(com, (result) => {
							var email = result.email;
							var blogTitle = result.blog.title;
							var url = config.url.blog_comment + result._id;
							mail.blogCommentOnReply(email, email, blogTitle, url);
							resolve(com);
						})
					}
					
				}
			})			
	});
});

commentsSchema.static('sendBlogComment', (id:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Comments
			.findById(id)
			.populate("blog")	
			.exec((err, comment) => {
				if(err){
					reject(err);
				}
				if(comment){
					var email = comment.email;
					var blogTitle = comment.blog.title;
					var url = config.url.blog_comment + id;
					mail.blogComment(email, blogTitle, url);
					resolve(comment);
				}
			})		
	});
});

commentsSchema.static('createComments', (comments:Object):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(comments)) {
			return reject(new TypeError('Comment is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		let body:any = comments;
		console.log(body);
		var type;
		if(body.commentID) {
			type = 'reply/';
		}
		else{
			type = 'comment/';	
		}

		Users
			.findOne({"email": body.email})
			.exec((err, user) => {
				if(err){
					reject(err);
				}
				if(user){
					var _comments = new Comments(comments);
					if(user != null){
						_comments.user = user._id;
					}
					_comments.type = type;
					_comments.save((err, saved) => {
						if(err){
							reject(err);
						}
						if(saved){
							Comments.sendSubscribeBlog(saved.blog);				
							Comments.sendBlogComment(saved.id);
							if(body.commentID){
								Comments.sendSubscribeComment(saved.blog.toString());
								Comments
									.findByIdAndUpdate(body.commentID, {
										$push: {
											"replies": saved._id
										}
									})
									.exec((err, update) => {
										err ? reject({message: err.message})
											: resolve({message: 'updated'});;
									});	
							}
							else{
								Blogs
									.findByIdAndUpdate(body.blog, {
										$push: {
											"comments": saved._id
										}
									})
									.exec((err, update) => {
										err ? reject({message: err.message})
											: resolve({message: 'updated'});
									});	
							}
						}
					})
				}
			})		
	});
});

commentsSchema.static('deleteReplies', (idComment:string, reply: Object, currentUser:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(idComment) && !_.isObject(reply)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		let body:any = reply;
		Comments.validationReply(currentUser, idComment, body.idReply).then(res => {
			if(res.message) {
				reject({message: res.message});
			}
			else if(res == true){
				Comments
					.update({"_id": idComment},
						{
							$pull: {
								"replies": body.idReply
							}	
						}
					)
					.exec((err, deleted) => {
						err ? reject({message: err.message})
						: resolve(deleted);
					});

				Comments
					.findByIdAndRemove(body.idReply)
					.exec((err, deleted) => {
						err ? reject({message: err.message})
						: resolve(deleted);
					});
			}
		});
	});
});

commentsSchema.static('deleteComments', (idComment:string, currentUser:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isString(idComment)) {
			return reject(new TypeError('Id is not a valid string.'));
		}
		Comments.validationComment(currentUser, idComment).then(res => {
			if(res.message) {
				reject({message: res.message});
			}
			else if(res == true){
				Comments
					.findById(idComment, (err, commentt ) => {
						if(commentt.replies != null) {
							var ObjectID = mongoose.Types.ObjectId; 
							var commentt_reply = [].concat(commentt.replies)
							for (var i = 0; i < commentt_reply.length; i++) {
								let reply = commentt_reply[i];
								Comments
									.findByIdAndRemove(reply)
									.exec((err, deleted) => {
										err ? reject({message: err.message})
										: resolve(deleted);
									});
							}	
						}
					})
					.exec((err, deleted) => {
						err ? reject({message: err.message})
						: resolve(deleted);
					});

				Comments
					.findByIdAndRemove(idComment)
					.exec((err, deleted) => {
						err ? reject({message: err.message})
						: resolve(deleted);
					});
			}
		});
	});
});

commentsSchema.static('updateComments', (id:string, comments:Object, currentUser:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(comments)) {
			return reject(new TypeError('Comment is not a valid object.'));
		}
		Comments.validationComment(currentUser, id).then(res => {
			if(res.message) {
				reject({message: res.message});
			}
			else if(res == true){
				Comments
					.findByIdAndUpdate(id, comments)
					.exec((err, update) => {
						err ? reject({message: err.message})
						: resolve(update);
					});
			}
		});
	});
});

commentsSchema.static('validationComment', (userId:string, commentsId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Comments
			.findById(commentsId, (err, result) => {
				var blog = result.blog;
				var comment_owner = result.user;
				if(userId != comment_owner) {
					Blogs
						.findById(blog, (err, blog) => {
							var blog_owner = blog.created_by;
							if(userId != blog_owner) {
								Users
									.findById(userId, (err, user) => {
										if(user.role != 'admin') {
											resolve({message: "Forbidden"});
										}
										else{
											resolve(true);
										}
									})
							}
							else{
								resolve(true);
							}
						})
				}
				else{
					resolve(true);
				}
			})
	});
});

commentsSchema.static('validationReply', (userId:string, commentsId:string, replyId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Comments
			.findById(replyId, (err, reply) => {
				if(reply.user != userId) {
					Comments
						.findById(commentsId, (err, comment) => {
							if(comment.user != userId) {
								Blogs
									.findById(comment.blog, (err, blog) => {
										var blog_owner = blog.created_by;
										if(userId != blog_owner) {
											Users
												.findById(userId, (err, user) => {
													if(user.role != 'admin') {
														resolve({message: "Forbidden"});
													}
													else{
														resolve(true);
													}
												})
										}
										else{
											resolve(true);
										}
									})
							}
							else{
								resolve(true);
							}
						})
				}
				else{
					resolve(true);
				}
			})
	});
});

let Comments = mongoose.model('Comments', commentsSchema);

export default Comments;