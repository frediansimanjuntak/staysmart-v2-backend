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

		Blogs
			.findById(body.blog_id)
			.exec((err, res) => {
				if(err){
					reject({message: err.message});
				}
				if(res){
					let blogTitle = res.title;
					if(body.comment_id){
						Comments
							.update({"_id": body.comment_id}, {
								$set: {
									"subscribes": false
								}
							})
							.exec((err, updated) => {
								err ? reject({message: err.message})
									: resolve({data: 'Successfully to unsubscribe Blog "'+ blogTitle +'" comments'});
							})
					}
					else{
						Subscribes.unSubscribes(blogObject).then((res) => {
							resolve({data: 'Successfully to unsubscribe Blog "'+ blogTitle +'"'});
						})
						.catch((err) => {
							reject({message: err.message});
						})
					}
				}
			})
		
	});
});

commentsSchema.static('sendSubscribeBlog', (idBlog:string, email:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Subscribes
			.find({"extra.reference_id": idBlog})
			.exec((err, subs) => {
				if(err){
					reject({message: err.message});
				}
				if(subs){
					_.each(subs, (result) => {
						let blog = result.extra.reference_id;
						Blogs
							.findById(blog)
							.exec((err, res) => {
								if(err){
									reject({message: err.message});
								}
								if(res){
									let blogTitle = res.blog.title;
									let blogSlug = res.blog.slug;
									let email = res.email;
									let name = res.name;
									let url = config.url.blog + blogSlug;
									let urlUnsubscribe = config.url.blog_unsubscribe+ blog + "&email=" + email;
									mail.blogSubscribe(email, name, blogTitle, url, urlUnsubscribe).then(send => {
										resolve({message: "email sent"});
									})
									.catch(err => {
										reject({message: err.message});
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
			.find({"blog": idBlog, "subscribes": true, "type": "blog"})
			.populate("blog")	
			.exec((err, com) => {
				if(err){
					reject({message: err.message});
				}
				if(com){
					if(com.length == 0){
						resolve({message: "no data"});
					}
					if(com.length >= 0){
						_.each(com, (result) => {
							let email = result.email;
							let blogTitle = result.blog.title;
							let url = config.url.blog_comment + result._id;
							let urlUnsubscribe = config.url.blog_unsubscribe+ idBlog + "&email=" + email + "&comment_id=" + result._id; 
							mail.blogCommentOnReply(email, email, blogTitle, url, urlUnsubscribe);
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
					reject({message: err.message});
				}
				if(comment){
					let email = comment.email;
					let blogTitle = comment.blog.title;
					let url = config.url.blog + id;
					let urlUnsubscribe = config.url.blog_unsubscribe + "&email=" + email + "&comment_id=" + id; 
					mail.blogComment(email, blogTitle, url, urlUnsubscribe);
					resolve(comment);
				}
			})		
	});
});

commentsSchema.static('checkEmailComment', (idComment:string, email:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Users
			.findOne({"email": email})
			.exec((err, user) => {
				if(err){
					reject({message: err.message});
				}
				if(user){
					Comments
						.findByIdAndUpdate(idComment, {
							$set: {
								"user": user._id
							}
						})
						.exec((err, result) => {
							err	? reject({message: err.message})
								: resolve(result);
						})
				}
				else{
					resolve({message: "email not registered"});
				}
			})		
	});
});

commentsSchema.static('addCommentInBlog', (idBlog:string, idComment:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Blogs
			.findByIdAndUpdate(idBlog, {
				$push: {
					"comments": idComment
				}
			})
			.exec((err, update) => {
				err ? reject({message: err.message})
					: resolve({message: 'updated'});
			});		
	});
});

commentsSchema.static('addReplyInComment', (idReply:string, commentId:string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		Comments
			.findByIdAndUpdate(commentId, {
				$push: {
					"replies": idReply
				}
			})
			.exec((err, update) => {
				err ? reject({message: err.message})
					: resolve({message: 'updated'});;
			});	
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
			type = 'comment';
		}
		else{
			type = 'blog';	
		}

		var _comments = new Comments(comments);
		_comments.type = type;
		_comments.save((err, saved) => {
			if(err){
				reject({message: err.message});
			}
			if(saved){
				let idComment = saved._id;
				let idBlog = saved.blog;
				let email = saved.email;
				Comments.checkEmailComment(idComment, email);
				Comments.sendSubscribeBlog(idBlog);				
				Comments.sendBlogComment(idComment);
				if(body.commentID){
					Comments.sendSubscribeComment(idBlog);
					Comments.addReplyInComment(idComment, body.commentID);	
					resolve(saved);
				}
				else{
					Comments.addCommentInBlog(idBlog, idComment);
					resolve(saved);	
				}
			}
		})			
	});
});

commentsSchema.static('addComments', (comments:Object, id: string, device: string):Promise<any> => {
	return new Promise((resolve:Function, reject:Function) => {
		if (!_.isObject(comments)) {
			return reject(new TypeError('Comment is not a valid object.'));
		}
		var ObjectID = mongoose.Types.ObjectId;  
		let body:any = comments;
		var type;
		if(body.comment_id) {
			type = 'comment';
		}
		else{
			type = 'blog';	
		}

		var _comments = new Comments();
		_comments.content = body.comment;
		_comments.name = body.name;
		_comments.email = body.email;
		_comments.type = type;
		_comments.blog = id;
		_comments.subscribes = body.subscribe;
		_comments.save((err, saved) => {
			if(err){
				reject({message: err.message});
			}
			if(saved){
				let idComment = saved._id;
				let idBlog = saved.blog;
				let email = saved.email;
				Comments.checkEmailComment(idComment, email);
				Comments.sendSubscribeBlog(idBlog);				
				Comments.sendBlogComment(idComment);
				if(body.comment_id){
					Comments.sendSubscribeComment(idBlog);
					Comments.addReplyInComment(idComment, body.comment_id);	
					resolve({
						message: {
							status: 'success',
							data: {
								_id: saved._id,
								name: saved.name,
								email: saved.email,
								comment: saved.content,
								type_comment: saved.type,
								blog: saved.blog,
								created_at: saved.created_at
							}
						},
						code: '200'
					});
				}
				else{
					Comments.addCommentInBlog(idBlog, idComment);
					resolve({
						message: {
							status: 'success',
							data: {
								_id: saved._id,
								name: saved.name,
								email: saved.email,
								comment: saved.content,
								type_comment: saved.type,
								blog: saved.blog,
								created_at: saved.created_at
							}
						},
						code: '200'
					});
				}
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