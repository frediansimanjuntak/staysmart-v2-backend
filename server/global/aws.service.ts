'use strict';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import config from '../config/environment/index';

var AWS = require('aws-sdk');
var fs = require('fs-extra');

export class AWSConfig {
  static getS3BucketName() {
    return config.awsBucket;
  }
  static getS3() {
    let s3Bucket = new AWS.S3( { params: {Bucket: config.awsBucket} } );
    return s3Bucket;
  }
  static init():void {
    let _root = process.cwd();
    console.log('Run AWS config...')
    AWS.config.loadFromPath(`${_root}/server/config/aws-${process.env.NODE_ENV}.json`);
    AWS.config.setPromisesDependency(require('bluebird'));
    console.log('AWS config done');
  }
}

export class AWSService {
  static upload(key:string, file:any) {
    return new Promise((resolve:Function, reject:Function) => {
      let fileStream:Object = fs.createReadStream(file.path);
      let urlParams:Object = { Bucket: AWSConfig.getS3BucketName(),  Key: key };
      let fileDetails:any = { name: file.name, type: file.type };
      let params:Object = {
        Bucket: AWSConfig.getS3BucketName(),
        Key: key,
        Body: fileStream
      };

      AWSService.s3UploadPromise(params).then((data:any) => {
        fileDetails.url = data.Location;
        resolve(fileDetails);
      }).catch(err => {
        reject(err);
      });
      // let putObjectPromise:Promise<any> = AWSConfig.getS3().putObject(params).promise();
      // let getObjectPromise:Promise<any> = AWSConfig.getS3().getObject(urlParams).promise();
      // putObjectPromise.then(function(res:any) {
      //   getObjectPromise.then(function(data:any) {
      //     console.log(data);
      //     // fileDetails.url = data;
      //     resolve();
      //   }).catch(function(err) {
      //     reject(err);
      //   });
      // }).catch(function(err) {
      //   reject(err);
      // });
    });
  }
  static delete(attachment:any) {
    return new Promise((resolve:Function, reject:Function) => {
      if (!_.isObject(attachment)) {
        reject(new TypeError('Attachment is not a valid object.'));
      }
      let regex:any = /(.*).com\//g;
      let startIndex:number = attachment.url.indexOfEnd(attachment.url.match(regex)[0]);
      let key = attachment.url.substr(startIndex, attachment.url.length);
      let params = {
        Bucket: AWSConfig.getS3BucketName(),
        Key: key
      };
      let deleteObjectPromise:Promise<any> = AWSConfig.getS3().deleteObject(params).promise();
      deleteObjectPromise.then(function(res) {
        res ? resolve(res) : reject(res);
      }).catch(function(err) {
        reject(err);
      });
    });
  }
  static s3UploadPromise(params) {
    return new Promise((resolve:Function, reject:Function) => {
      AWSConfig.getS3().upload(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
