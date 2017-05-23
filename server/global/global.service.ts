'use strict';
import config from '../config/environment/index';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

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

  static validObjectEmpty(data){
    function pruneEmpty(obj) {
				return function prune(current) {
					_.forOwn(current, function (value, key) {
            if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) || (_.isString(value) && _.isEmpty(value)) || (_.isObject(value) && _.isEmpty(prune(value)))) {
              delete current[key];
            }
					});
					// remove any leftover undefined values from the delete 
					// operation on an array
					if (_.isArray(current)) _.pull(current, undefined);
					return current;
				}(_.cloneDeep(obj));  // Do not modify the original object, create a clone instead
			}

			_.mixin({
			pruneEmpty: pruneEmpty
			});

			var result = _.pruneEmpty(data);
			return(result);
  }

  static calcTermPayment(term_lease){
    let term_payment;
    if(term_lease <= 12) { term_payment = 1}
    else if (term_lease == 24) { term_payment = 2}
    return term_payment;
  }

  static calcSecurityDeposit(term_lease, month) {
    // return (term_lease / 12 ) * month;
    let year = term_lease / 12;
    if (year <= 1)
      return month;
    else
      return year * month;
  }
  
  static calcSDA(term_lease, price) {
    // if(term_lease == 6) { term_lease = 12 }
    let sda = (price * term_lease) * 0.4 / 100;
    // sdafix = sda.toFixed(2);
    return Math.floor(sda);
  }

  static termLeaseExtend(term_lease) {
    let term_extend;
    if(term_lease == 6 ) { term_extend = 6; } else { term_extend = 12; }
    return term_extend;
  }
}

