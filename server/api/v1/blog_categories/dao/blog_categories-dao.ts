import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import blogCategoriesSchema from '../model/blog_categories-model';

blogCategoriesSchema.static('getAll', ():Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        let _query = {};

        BlogCategories
          .find(_query)
          .exec((err, blog_categories) => {
              err ? reject(err)
                  : resolve(blog_categories);
          });
    });
});

blogCategoriesSchema.static('getById', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {

        BlogCategories
          .findById(id)
          .exec((err, blog_categories) => {
              err ? reject(err)
                  : resolve(blog_categories);
          });
    });
});

blogCategoriesSchema.static('createBlogCategories', (blog_categories:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(blog_categories)) {
        return reject(new TypeError('Category is not a valid object.'));
      }
      var ObjectID = mongoose.Types.ObjectId;  
      let body:any = blog_categories;
      
      var _blog_categories = new BlogCategories(blog_categories);
          _blog_categories.save((err, saved)=>{
            err ? reject(err)
                : resolve(saved);
          });
    });
});

blogCategoriesSchema.static('deleteBlogCategories', (id:string):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isString(id)) {
            return reject(new TypeError('Id is not a valid string.'));
        }

        BlogCategories
          .findByIdAndRemove(id)
          .exec((err, deleted) => {
              err ? reject(err)
                  : resolve();
          });
        
    });
});

blogCategoriesSchema.static('updateBlogCategories', (id:string, blog_categories:Object):Promise<any> => {
    return new Promise((resolve:Function, reject:Function) => {
        if (!_.isObject(blog_categories)) {
          return reject(new TypeError('Category is not a valid object.'));
        }

        BlogCategories
        .findByIdAndUpdate(id, blog_categories)
        .exec((err, updated) => {
              err ? reject(err)
                  : resolve(updated);
          });
    });
});

let BlogCategories = mongoose.model('BlogCategories', blogCategoriesSchema);

export default BlogCategories;