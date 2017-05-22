import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as phantom from 'phantom';

export class phantomDAO{
	static readLink(data:Object){
        return new Promise((resolve:Function, reject:Function) => {
            let body:any = data;
            console.log(body);
            // fs.readFile(body.url, function(err, data){
            //     err ? reject(err)
			// 	    : resolve(data);
            // });
            // var page = require('webpage');
            // console.log(page);
            // console.log(body.url);
            // page.open(body.url, function (status) {
            //     console.log(status);
            //     // var content = page.content;
            //     // console.log('Content: ' + content);
            //     // resolve(content);
            //     phantom.exit();
            // });

            phantom.create().then(function(ph) {
                ph.createPage().then(function(page) {
                    page.open(body.url).then(function(status) {
                        
                        if (status !== 'success') {
                            console.log('Unable to load the address!');
                            ph.exit();
                        } else {
                            console.log("render");
                             // Wait for 'signin-dropdown' to be visible                            
                            //  page.evaluate(function() {
                            //     console.log("doc", document);
                            //     document.addEventListener('DOMContentLoaded', function() {
                            //         console.log('success');
                            //     }, false);
                            //     console.log("Added listener to wait for page ready");
                            // });
                                    
                            console.log(page);
                            page.property('content').then(function(content){
                                resolve(content);
                                ph.exit();                               
                            }); 
                        }                       
                        // page.render('google.pdf').then(function() {
                            // console.log('Page Rendered');
                            // ph.exit();
                        // });
                    });
                });
            });
        })
    }
}