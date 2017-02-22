'use strict';
import config from '../config/environment/index';

declare global {
  interface String {
    indexOfEnd(string:string): number;
    lastIndexOfEnd(string:string): number;
  }
}

export class GlobalService {
  static init():void {
    let _root = process.cwd();
  }
  static initGlobalFunction():void {
    String.prototype.indexOfEnd = function(string) {
      var io = this.indexOf(string);
      return io == -1 ? -1 : io + string.length;
    };

    String.prototype.lastIndexOfEnd = function(string) {
      var io = this.lastIndexOf(string);
      return io == -1 ? -1 : io + string.length;
    };
  }
  static validateEmail(email) {
    var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
  }
  static validateObjectId(id) {
    var patt = new RegExp("^[0-9a-fA-F]{24}$");
    return patt.test(id);
  }
}
