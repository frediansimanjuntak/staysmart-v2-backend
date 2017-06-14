import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import blogsSchema from '../model/blogs-model';
import Comments from '../../comments/dao/comments-dao';
import Attachments from '../../attachments/dao/attachments-dao';
import Subscribes from '../../subscribe/dao/subscribes-dao';
import BlogCategories from '../../blog_categories/dao/blog_categories-dao';
import Users from '../../users/dao/users-dao';
import Developments from '../../developments/dao/developments-dao';
import {mail} from '../../../../email/mail';
import {blogHelper} from '../../../../helper/blog.helper';

blogsSchema.static('getAll', (device: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        Blogs
          .find(_query)
          .populate("cover category")
          .populate([{
            path: 'comments',
            populate: [{
              path: 'user',
              model: 'Users',
              populate: {
                path: 'picture',
                model: 'Attachments'
              },
              select: 'username picture'
            },
            {
              path: 'replies',
              model: 'Comments'
            }]
          },{
            path: 'created_by',
            populate: {
              path: 'picture',
              model: 'Attachments'
            },
            select: 'username picture'
          }])
          .sort({"created_at": -1})
          .exec((err, blogs) => {
            if (err) {
              reject({message: err.message});
            }
            else {
              if ( device != 'desktop' ) {
                blogHelper.getAll(blogs).then(result => {
                  resolve(result);
                });
              }
              else {
                resolve(blogs);
              }
            }
          });
    });
});

blogsSchema.static('getById', (id:string, device: string, userEmail: Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Blogs
          .findById(id)
          .populate("cover category")
          .populate([{
            path: 'comments',
            populate: [{
                path: 'user',
                model: 'Users',
                populate: {
                  path: 'picture',
                  model: 'Attachments'
                },
                select: 'username picture verification email'
              }, 
              {
                path: 'replies',
                model: 'Comments',
                populate: {
                  path: 'user',
                  model: 'Users',
                  populate: {
                    path: 'picture',
                    model: 'Attachments'
                  },
                  select: 'username picture verification email'
                }
            }]
          },{
            path: 'created_by',
            populate: {
              path: 'picture',
              model: 'Attachments'
            },
            select: 'username picture'
          }])
          .exec((err, blogs) => {
            if (err) {
              reject({message: err.message});
            }
            else {
              if ( device != 'desktop' ) {
                blogHelper.getById(blogs, userEmail).then(result => {
                  resolve(result);
                });
              }
              else {
                resolve(blogs);
              }
            }
          });
    });
});

blogsSchema.static('getBySlug', (slug:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        Blogs
          .findOne({"slug": slug})
          .populate("cover category")
          .populate([{
            path: 'comments',
            populate: [{
              path: 'user',
              model: 'Users',
              populate: {
                path: 'picture',
                model: 'Attachments'
              },
              select: 'username picture'
            },
            {
              path: 'replies',
              model: 'Comments',
              populate: {
                path: 'user',
                model: 'Users',
                populate: {
                  path: 'picture',
                  model: 'Attachments'
                },
                select: 'username picture'
              },
            }]
          },{
            path: 'created_by',
            populate: {
              path: 'picture',
              model: 'Attachments'
            },
            select: 'username picture'
          }])
          .exec((err, blog) => {
            if (err) {
              reject(err);
            }
            else if (blog) {
              Blogs.getBlogSimilar(blog.slug, blog.category._id).then((res) => {
                resolve({"blog": blog, "similar": res});
              })
              .catch((err) => {
                reject(err);
              })
            }
          });
    });
});

blogsSchema.static('getMight', (id: string, device: string, userEmail: string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      Blogs.findById(id)
      .exec((err, blog) => {
        if (err) { reject({message: err.message});}
        else {
          Blogs.getBlogSimilar(blog.slug, blog.category).then(similar => {
            blogHelper.getAll(similar).then(res => {
              resolve(res);
            })
          })
        }
      })
    });
});

blogsSchema.static('getBlogSimilar', (slug:string, category:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query;
        if (category) {
          _query = {"category": category, "slug": { $nin: [ slug ] }}
        }
        else {
          _query = {"slug": { $nin: [ slug ] }}
        }
        Blogs
          .find(_query)
          .populate("cover category")
          .sort({"created_at": -1})  
          .limit(4)        
          .exec((err, blogs) => {
              if (err) {
                reject(err);
              }
              else if (blogs) {
                let blogData = [];
                let defaultLengthBlog = 4;
                let lengthBlog = blogs.length;
                let different = defaultLengthBlog - lengthBlog;
                if (different == 0) {
                  resolve(blogs);
                }
                else {
                  if (blogs.length > 0) {
                    for (var i = 0; i < blogs.length; i++) {
                      let blog = blogs[i];
                      blogData.push(blog);
                    }                    
                  }                  
                  Blogs.getNewBlog(slug, category, different).then((res) => {
                    for (var j = 0; j < res.length; j++) {
                      let result = res[j];
                      blogData.push(result);
                    }   
                    resolve(blogData);
                  })
                  .catch((err) => {
                    reject(err);
                  })
                }
              }
          });
    });
});

blogsSchema.static('getNewBlog', (slug:string, category:string, limit:number):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {"slug": { $nin: [ slug ] }, "category": { $nin: [ category ] }}
        Blogs
          .find(_query)
          .populate("cover category")
          .sort({"created_at": -1})  
          .limit(limit)        
          .exec((err, blogs) => {
              if (err) {
                reject(err);
              }
              else if (blogs) {
                resolve(blogs);               
              }
          });
    });
});

blogsSchema.static('createBlogs', (blogs:Object, created_by:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(blogs)) {
        return reject(new TypeError('Blogs is not a valid object.'));
      }      
      let ObjectID = mongoose.Types.ObjectId;  
      let body:any = blogs;
      let slug_name = Developments.slug(body.title);
      let _blogs = new Blogs(blogs);
      _blogs.slug = slug_name;
      _blogs.created_by = created_by;
      _blogs.save((err, saved)=>{
        err ? reject({message: err.message})
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
          .findById(id, (err, blogs) => {
            if (blogs.cover != null) {
              var ObjectID = mongoose.Types.ObjectId;
                  Attachments
                      .findByIdAndRemove(blogs.cover)
                      .exec((err, deleted) => {
                        err ? reject({message: err.message})
                            : resolve(deleted);
                      });
                }
          });

        Blogs
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject({message: err.message})
                  : resolve();
          });
        
    });
});

blogsSchema.static('updateBlogs', (id:string, blogs:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(blogs)) {
          return reject(new TypeError('Blogs is not a valid object.'));
        }
        let body:any = blogs;
        if (body.title != null) {
          var slug_name = Developments.slug(body.title);
        }
        
        let blogObj = {$set: {}};
        for(var param in blogs) {
          blogObj.$set[param] = blogs[param];
        }
        if (body.title != null) {
          blogObj.$set['slug'] = slug_name;
        }

        Blogs
          .findByIdAndUpdate(id, blogObj)
          .exec((err, update) => {
             if (err) {
               reject({message: err.message});
             }
             else if (update) {
              Blogs
                .findById(id)
                .populate("created_by")
                .exec((err, blog) => {
                  if (err) {
                    reject({message: err.message});
                  }
                  else if (blog) {
                    var emailTo = blog.created_by.email;
                    var blogTitle = blog.title;
                    
                    mail.blogUpdate(emailTo, blogTitle);
                    resolve({message: 'blog updated'});
                  }
                })
             }
          });  
    });
});

blogsSchema.static('subscribeBlog', (id:string, device: string, data:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }
        let body:any = data;
        Blogs
          .findById(id)
          .exec((err, blogs) => {
            if (err) { reject(err); }
            else {
              Users
                .findById(body.userId)
                .exec((err, user) => {
                  if (err) { reject(err); }
                  else if (user) { 
                    let data = {
                      email: user.email,
                      blog_id: blogs._id
                    };
                    Subscribes.createSubscribes(data).then((res) => {
                      Blogs
                        .findById(id)
                        .exec((err, blog) => {
                          if (err) { reject(err); }
                          else{
                            if ( device != 'desktop' ) {
                              blogHelper.getSubscribeBlog(blog).then(result => {
                                resolve(result);
                              });
                            }
                            else {
                              resolve(blog);
                            }
                          }
                        })
                    })
                  } 
                  else { resolve({message: "user not found"})};
                })
            }
          })        
    });
});

let Blogs = mongoose.model('Blogs', blogsSchema);

export default Blogs;