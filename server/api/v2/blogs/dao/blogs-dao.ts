import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import blogsSchema from '../model/blogs-model';
import Comments from '../../comments/dao/comments-dao';
import Attachments from '../../attachments/dao/attachments-dao';
import BlogCategories from '../../blog_categories/dao/blog_categories-dao';
import Users from '../../users/dao/users-dao';

blogsSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Blogs
          .find(_query)
          .populate("cover category comments created_by")
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
          .populate("cover category comments created_by")
          .exec((err, blogs) => {
              err ? reject(err)
                  : resolve(blogs);
          });
    });
});

blogsSchema.static('createBlogs', (blogs:Object, covers:Object, created_by:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(blogs)) {
        return reject(new TypeError('Blogs is not a valid object.'));
      }
      
      Attachments.createAttachments(covers).then(res => {
        var idAttachment=res.idAtt;

        var ObjectID = mongoose.Types.ObjectId;  
        let body:any = blogs;
        
        var _blogs = new Blogs(blogs);
            _blogs.created_by = created_by;
            _blogs.cover = idAttachment;
            _blogs.save((err, saved)=>{
              err ? reject(err)
                  : resolve(saved);
            });
      });
    });
});

blogsSchema.static('deleteBlogs', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        Blogs
          .findById(id,(err,blogs) => {
            if(blogs.cover != null){
              var ObjectID = mongoose.Types.ObjectId;
                  Attachments
                      .findByIdAndRemove(blogs.cover)
                      .exec((err, deleted) => {
                        err ? reject(err)
                            : resolve(deleted);
                      });
                }
          });

        Blogs
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

blogsSchema.static('updateBlogs', (id:string, blogs:Object, covers:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(blogs)) {
          return reject(new TypeError('Blogs is not a valid object.'));
        }
        if(covers != null) {
          Attachments.createAttachments(covers).then(res => {
            var idAttachment=res.idAtt;
            let blogObj = {$set: {}};
            for(var param in blogs) {
              blogObj.$set[param] = blogs[param];
            }
            blogObj.$set['cover'] = idAttachment;

            Blogs
              .findByIdAndUpdate(id, blogObj)
              .exec((err, updated) => {
                    err ? reject(err)
                        : resolve(updated);
                });  
          });
        }
        else{
          Blogs
            .findByIdAndUpdate(id, blogs)
            .exec((err, updated) => {
                  err ? reject(err)
                      : resolve(updated);
              }); 
        }
           
        
    });
});

let Blogs = mongoose.model('Blogs', blogsSchema);

export default Blogs;