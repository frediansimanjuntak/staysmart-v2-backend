import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import commentsSchema from '../model/comments-model';
import Blogs from '../../blogs/dao/blogs-dao';
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
				}
			})
			.exec((err, comments) => {
				err ? reject(err)
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
				}
			})
			.exec((err, comments) => {
				err ? reject(err)
				: resolve(comments);
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
		var type;
		if(body.commendId) {
			type = 'reply/';
		}
		else{
			type = 'comment/';	
		}
		Users
			.findOne({"email": body.email})
			.exec((err, user) => {
				var _comments = new Comments(comments);
					if(user) {
						_comments.user = user._id;	
					}
					_comments.type = type;
					_comments.save((err, saved)=>{
						if(err) {
							reject(err);
						}
						else if(saved) {
							Blogs
								.findById(body.blog, (err, blog) => {
									if(err) {
										reject(err);
									}
									else{
										var email = body.email;
										var blogTitle = blog.title;
										var url = config.url.blog_comment+saved._id;
										mail.blogComment(email, blogTitle, url);
										if(body.commentID) {
											Comments
												.findByIdAndUpdate(body.commentID, {
													$push: {
														"replies": saved._id
													}
												})
												.exec((err, update) => {
													err ? reject(err)
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
													err ? reject(err)
													: resolve({message: 'updated'});
												});	
										}
									}
								})
						}
					});
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
						err ? reject(err)
						: resolve(deleted);
					});

				Comments
					.findByIdAndRemove(body.idReply)
					.exec((err, deleted) => {
						err ? reject(err)
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
										err ? reject(err)
										: resolve(deleted);
									});
							}	
						}
					})
					.exec((err, deleted) => {
						err ? reject(err)
						: resolve(deleted);
					});

				Comments
					.findByIdAndRemove(idComment)
					.exec((err, deleted) => {
						err ? reject(err)
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
						err ? reject(err)
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
						})
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
									})
							}
						})
				}
			})
	});
});

let Comments = mongoose.model('Comments', commentsSchema);

export default Comments;