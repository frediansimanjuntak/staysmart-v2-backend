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
				return reject(new TypeError('User is not a valid object.'));
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

commentsSchema.static('deleteComments', (id:string):Promise<any> => {
		return new Promise((resolve:Function, reject:Function) => {
				if (!_.isString(id)) {
						return reject(new TypeError('Id is not a valid string.'));
				}

				Comments
					.findByIdAndRemove(id)
					.exec((err, deleted) => {
							err ? reject(err)
									: resolve();
					});
				
		});
});

commentsSchema.static('updateComments', (id:string, comments:Object):Promise<any> => {
		return new Promise((resolve:Function, reject:Function) => {
				if (!_.isObject(comments)) {
					return reject(new TypeError('User is not a valid object.'));
				}

				Comments
				.findByIdAndUpdate(id, comments, {
						$set: {"comments.created_at": Date.now()}
				})
				.exec((err, updated) => {
							err ? reject(err)
									: resolve(updated);
					});
		});
});

let Comments = mongoose.model('Comments', commentsSchema);

export default Comments;