import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import blogsSchema from '../model/blogs-model';
import Comments from '../../comments/dao/comments-dao';

blogsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Blogs
          .find(_query)
          .populate("comments")
          .exec((err, blogs) => {
              err ? reject(err)
                  : resolve(blogs);
          });
    });
});

blogsSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Blogs
          .findById(id)
          .populate("comments")
          .exec((err, blogs) => {
              err ? reject(err)
                  : resolve(blogs);
          });
    });
});

blogsSchema.static('createBlogs', (blogs:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(blogs)) {
        return reject(new TypeError('Blogs is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = blogs;
      
      var _blogs = new Blogs(blogs);
          _blogs.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

blogsSchema.static('deleteBlogs', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        Blogs
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

blogsSchema.static('updateBlogs', (id:string, blogs:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(blogs)) {
          return reject(new TypeError('Blogs is not a valid object.'));
        }

        Blogs
        .findByIdAndUpdate(id, blogs)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let Blogs = mongoose.model('Blogs', blogsSchema);

export default Blogs;