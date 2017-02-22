import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import commentsSchema from '../model/comments-model';
import Blogs from '../../blogs/dao/blogs-dao';

commentsSchema.static('getAll', ():Promise<any> => {
		return new Promise((resolve:Function, reject:Function) => {
				let _query = {};

				Comments
					.find(_query)
					.populate("replies")
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
					.populate("replies")
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
			
			var _comments = new Comments(comments);
					_comments.save((err, saved)=>{
						err ? reject(err)
								: resolve(saved);
					});

			var commentId = _comments._id; 

			if(body.commentID) {
				Comments
					.findByIdAndUpdate(body.commentID, {
							$push: {
								"replies": commentId
							}
					})
					.exec((err, update) => {
								err ? reject(err)
										: resolve(update);
						});						
			}
			else{
				Blogs
					.findByIdAndUpdate(body.blog, {
							$push: {
								"comments": commentId
							}
						})
						.exec((err, update) => {
								err ? reject(err)
										: resolve(update);
						});	
			}
		});
});

commentsSchema.static('deleteReplies', (idComment:string, reply: Object):Promise<any> => {
		return new Promise((resolve:Function, reject:Function) => {
				if (!_.isString(idComment) && !_.isObject(reply)) {
						return reject(new TypeError('Id is not a valid string.'));
				}
				let body:any = reply;
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
		});
});

commentsSchema.static('deleteComments', (idComment:string):Promise<any> => {
		return new Promise((resolve:Function, reject:Function) => {
				if (!_.isString(idComment)) {
						return reject(new TypeError('Id is not a valid string.'));
				}
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
		});
});

commentsSchema.static('updateComments', (id:string, comments:Object):Promise<any> => {
		return new Promise((resolve:Function, reject:Function) => {
				if (!_.isObject(comments)) {
					return reject(new TypeError('Comment is not a valid object.'));
				}

				Comments
				.findByIdAndUpdate(id, comments)
				.exec((err, updated) => {
							err ? reject(err)
									: resolve(updated);
					});
		});
});

let Comments = mongoose.model('Comments', commentsSchema);

export default Comments;