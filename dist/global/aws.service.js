'use strict';
var Promise = require("bluebird");
var _ = require("lodash");
var index_1 = require("../config/environment/index");
var AWS = require('aws-sdk');
var fs = require('fs-extra');
var AWSConfig = (function () {
    function AWSConfig() {
    }
    AWSConfig.getS3BucketName = function () {
        return index_1.default.awsBucket;
    };
    AWSConfig.getS3 = function () {
        var s3Bucket = new AWS.S3({ params: { Bucket: index_1.default.awsBucket } });
        return s3Bucket;
    };
    AWSConfig.init = function () {
        var _root = process.cwd();
        console.log('Run AWS config...');
        AWS.config.loadFromPath(_root + "/server/config/aws-" + process.env.NODE_ENV + ".json");
        AWS.config.setPromisesDependency(require('bluebird'));
        console.log('AWS config done');
    };
    return AWSConfig;
}());
exports.AWSConfig = AWSConfig;
var AWSService = (function () {
    function AWSService() {
    }
    AWSService.upload = function (key, file) {
        return new Promise(function (resolve, reject) {
            var fileStream = fs.createReadStream(file.path);
            var urlParams = { Bucket: AWSConfig.getS3BucketName(), Key: key };
            var fileDetails = { name: file.name, type: file.type };
            var params = {
                Bucket: AWSConfig.getS3BucketName(),
                Key: key,
                Body: fileStream
            };
            AWSService.s3UploadPromise(params).then(function (data) {
                fileDetails.url = data.Location;
                resolve(fileDetails);
            }).catch(function (err) {
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
    };
    AWSService.delete = function (attachment) {
        return new Promise(function (resolve, reject) {
            if (!_.isObject(attachment)) {
                reject(new TypeError('Attachment is not a valid object.'));
            }
            var regex = /(.*).com\//g;
            var startIndex = attachment.url.indexOfEnd(attachment.url.match(regex)[0]);
            var key = attachment.url.substr(startIndex, attachment.url.length);
            var params = {
                Bucket: AWSConfig.getS3BucketName(),
                Key: key
            };
            var deleteObjectPromise = AWSConfig.getS3().deleteObject(params).promise();
            deleteObjectPromise.then(function (res) {
                res ? resolve(res) : reject(res);
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    AWSService.s3UploadPromise = function (params) {
        return new Promise(function (resolve, reject) {
            AWSConfig.getS3().upload(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    return AWSService;
}());
exports.AWSService = AWSService;
//# sourceMappingURL=aws.service.js.map