import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as phantom from 'phantom';

export class phantomDAO{
	static getHtml(data:Object){
        return new Promise((resolve:Function, reject:Function) => {
            let body:any = data;
            let url = body.url;
            var res = url.substring(0, 7);
            let urlLink;
            if(res != "http://"){
                urlLink = "http://"+url.toString();
            }
            else{
                urlLink = url;
            }
            phantom.create().then(function(ph) {
                ph.createPage().then(function(page) {
                    page.open(urlLink).then(function(status) {                      
                        if (status !== 'success') {
                            reject({message: 'Unable to load the address!'})
                            ph.exit();
                        } else {
                            page.property('content').then(function(content){
                                resolve(content);
                                ph.exit();                               
                            }).catch(function(err) {
                                reject(err);
                                ph.exit();
                            }); 
                        }        
                    });
                });
            });
        })
    }
}