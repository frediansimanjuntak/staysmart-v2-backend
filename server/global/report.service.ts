'use strict';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as request from 'request';
import * as moment from 'moment';
var base64 = require('base-64');
import Developments from '../api/v2/developments/dao/developments-dao';
import Payments from '../api/v2/payments/dao/payments-dao';

var fs      = require('fs');
var pdf2img = require('pdf2img');

export class numberToWords{
	static toWords(s){
		var th = ['','thousand','million', 'billion','trillion'];
		var dg = ['zero','one','two','three','four', 'five','six','seven','eight','nine']; 
		var tn = ['ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen', 'seventeen','eighteen','nineteen']; 
		var tw = ['twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
		s = s.toString(); 
		s = s.replace(/[\, ]/g,''); 
		if (s != parseFloat(s)) return 'not a number'; 
		var x = s.indexOf('.'); 
		if (x == -1) x = s.length; 
		if (x > 15) return 'too big'; 
		var n = s.split(''); 
		var str = ''; 
		var sk = 0; 
		for (var i = 0; i < x; i++) {
			if((x-i) %3 == 2) {
				if (n[i] == '1') {
					str += tn[Number(n[i+1])] + ' '; 
					i++; 
					sk = 1;
				}
				else if (n[i] != 0) {
					str += tw[n[i]-2] + ' ';
					sk = 1;
				}
			} 
			else if (n[i] != 0) {
				str += dg[n[i]] +' '; 
				if ((x-i) %3 == 0) 
					str += 'hundred ';
				sk = 1;
			} 
			if ((x-i) %3 == 1) {
				if (sk)
					str += th[(x-i-1)/3] + ' ';
				sk = 0;
			}
		} 
		if (x != s.length) {
			var y = s.length; 
			str += 'point '; 
			for (var i:number = x+1; i < y; i++) 
				str += dg[n[i]] +' ';
		} 
		return str.replace(/\s+/g,' ');
	}
}

var objectFunction = {
  convertDate: function(strDate, strFormat) { return moment(Date.parse(strDate)).format(strFormat); },
  currencyToNumber: function(value) { return Number(value.replace(/[^0-9\.]+/g,"")); },
  toCurrency: function(value) { return parseFloat(value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); },
  toWords: function(value) { 
  	if (isNumeric(value)) { 
  		return numberToWords.toWords(value).toUpperCase(); 
  	} 
},
  toCurrencySum: function(val1, val2) {
    if(val1 && val2) {
      let sum = parseFloat(val1) + parseFloat(val2);
      return sum.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }
  },
  toWordSum: function(val1, val2)  {
    if(isNumeric(val1) && isNumeric(val2)) {
      let sum = parseFloat(val1) + parseFloat(val2);
      return numberToWords.toWords(sum).toUpperCase();
    }
  },
  ordinal: function(strDate, strFormat) { return moment(Date.parse(strDate)).format(strFormat).slice(-2); },
  devName: function(devId) {
  	Developments
  		.findById(devId)
  		.exec((err, res) => {
  			if(err){
  				return "Development not found";
  			}
  			else if(res){
  				return (res.name); 				
  			}
			  else{
				  return "Development not found"
			  }
  		})
  },
  payment: function(id) {
    if(id) {
      let payment = Payments.findOne({ _id: id });
      if(payment) {
        return payment;
      }
    }
  },
  furnish: function(value) {
    if(value) {
      if(value == 'fully') {
        return 'fully furnished';
      } else if(value == 'partially') {
        return 'partially furnished';
      } else {
        return value;
      }
    }
  }
};

export class report {
	static replaceCode(string, data){
		return new Promise((resolve:Function, reject:Function) => {
		// var result = text.match(/<input(.*?)\/>/g);
		// var matches = string.match(/<span\s(?:\bclass="\bdo-remove"\s+\bfield=".*?")>(.*?)<\/span\>/g);
		var matches = string.match(/<(?:(span|ol|))\s(?:\bclass="do-remove(.*?)"\s+\bfield=".*?")>([\s\S]*?)<\/(?:(span|ol|))>/g);
		// var matches = string.match(/\[`(.*?)\`]/g);
		_.each(matches, function(submatch) {
		// var name = submatch.match(/\[`(.*?)\`]/)[1];
		var name = submatch.match(/field="([^"]+)"/)[1];
		var getData;
		var replaced;
		if (name.match(/\s/)) {
			var tokens = [].concat.apply([], name.split("'").map(function(v,i){
			return i%2 ? v : v.split(' ')
			})).filter(Boolean)
			let functionName = tokens[0];
			let propertyName = tokens[1];
			let options = tokens[2];
			let propertyData = report.objectByString(data, propertyName);
			if (options) {
				if(options.match(/form_data./g)) {
					options = report.objectByString(data, options);
				}
				getData = objectFunction[functionName](propertyData, options);
			} 
			else {
				getData = objectFunction[functionName](propertyData);
			}
		} 
		else {
			getData = report.objectByString(data, name);
		}

		if (getData) {
			switch (name) {
				case 'form_data.occupants':
					var modifiedData = "";
					if (getData.length && getData.length > 0) {
						_.each(getData, function(subData, index) {
						if (index === 0) {
							// modifiedData += '<ol class="roman">\n';
							modifiedData += '<li><table width="100%"><tr><td width="50%">Name: <i class="b">' + subData.name + '</i></td>' +
							'<td>Passport/NRIC No: <i class="b">' + subData.id_no + '</i></td></tr></table></li>';
						} 
						else {
							modifiedData += '<li><table width="100%"><tr><td width="50%">Name: <i class="b">' + subData.name + '</i></td>' +
							'<td>Passport/NRIC No: <i class="b">' + subData.id_no + '</i></td></tr></table></li>';
						}
						// if (index + 1 === getData.length) {
						//   modifiedData += "\n</ol>";
						// }
						});
					} 
					getData = modifiedData;
				break;
			case 'form_data.tenant':
				let populate = report.objectByString(data, 'form_data.populate_tenant');
				var modifiedData = "";
				if(populate) {
					modifiedData += '<li><table width="100%"><tr><td width="50%">Name: <i class="b">' + getData.name + '</i></td>' +
					'<td>Passport/NRIC No: <i class="b">' + getData.id_no + '</i></td></tr></table></li>';
				}
				getData = modifiedData;
			break;
			case 'form_data.requirements':
				var modifiedData = "";
				if (getData.length && getData.length > 0) {
					_.each(getData, function(subData, index) {
					if (index === 0) {
						// modifiedData += '<ol class="alpha blue b i" contenteditable="false">\n';
						modifiedData += '<li>' + subData + '</li> ';
						// } else if (index + 1 === getData.length) {
						//   modifiedData += '<li>' + subData + '</li>\n';
						//   modifiedData += "</ol>";
					} 
					else {
						modifiedData += '<li>' + subData + '</li> ';
					}

					// if (index + 1 === getData.length) {
					//   modifiedData += "\n</ol>";
					// }
					});
				}
				// console.log(modifiedData);
				getData = modifiedData;
			break;
			case 'property.details.furnishing':
				if (getData == 'fully') {
					getData = 'fully furnished / <strike>partially furnished / unfurnished</strike>';
				} 
				else if (getData == 'partially') {
					getData = '<strike>fully furnished</strike> / partially furnished / <strike>unfurnished</strike>';
				} 
				else if (getData == 'not furnished') {
					getData = '<strike>fully furnished / partially furnished /</strike> unfurnished';
				} 
				else {
					getData = 'fully furnished / partially furnished / unfurnished';
				}
			break;
			case 'form_data.tenant_sign':
				getData = '<img src=' + getData + ' alt="" > ';
			break;
			case 'form_data.payment_proof':
			  // let paymentProof = objectFunction['payment'](getData);
			  let paymentProof = getData;
			  if(paymentProof) {
			  	let fileType = paymentProof.type; 				
				if (paymentProof.url) {
					let url = paymentProof.url;
					let subType = fileType.substring(0, 5);
					if(subType == 'image'){
						getData = '<img src="' + url + '" height="250px" /> ';
					}
					else if(fileType == 'application/pdf'){
						getData = '<embed src="' + url + '" width="800px" height="2100px" />'
					}
				}
				else {
					getData = 'Attachment Not Found';
				}

				// let subType = fileType.substring(0, 5);
				// if(subType == 'image'){
				// 	getData = '<img src="' + url + '" height="500px" /> ';
				// }
				// else if(fileType == 'application/pdf'){
				// 	// getData = '<embed src="' + url + '" type="application/pdf"/>';
				// 	// getData = '<iframe src="' + url + '" type="application/pdf"></iframe>';
				// 	// getData = '<a href="' + url + '"></a>';
				// 	// app.get(/(.*\.pdf)\/([0-9]+).png$/i, function (req, res) {
				// 	var input   = url;
				// 	console.log(input);
				// 	pdf2img.setOptions({
				// 		type: 'png',                      // png or jpeg, default png 
				// 		size: 1024,                       // default 1024 
				// 		density: 600,                     // default 600 
				// 		outputdir: '../../../../template/report-template/lib', // mandatory, outputdir must be absolute path 
				// 		targetname: 'test'                // the prefix for the generated files, optional 
				// 	});

				// 	pdf2img.convert(input, function(err, info) {
				// 		if (err) console.log(err)
				// 		else console.log(info);
				// 	});
				// } 

			    // let fileType = paymentProof.original.type;
			    // let subType = fileType.substring('0', '5');
			    // if(subType == 'image') {
			    //   let base64 = waitBase64(paymentProof.url());
			    //   getData = '<img src="' + base64 + '" height="500px" /> ';
			    // } else if(fileType == 'application/pdf') {
			    //   let arrBase64 = waitPdfImg(paymentProof.url());
			    //   getData = '';
			    //   if(arrBase64 && arrBase64.length > 0) {
			    //     for (var index = 0; index < arrBase64.length; index++) {
			    //       getData += '<div><img src="' + arrBase64[index] + '" width="100%" /></div>'
			    //     }
			    //   }
			    // } else {
			    //   getData = '';
			    // }
			  }
			  break;
			case 'form_data.second_payment_proof':
			  // let secPaymentProof = objectFunction['payment'](getData);
			  let secPaymentProof = getData;
			  if(secPaymentProof.url) {
					let url = secPaymentProof.url;
					let fileType = secPaymentProof.type;
					if (url) {
						let subType = fileType.substring(0, 5);
						if(subType == 'image'){
							getData = '<img src="' + url + '" height="250px" /> ';
						}
						else if(fileType == 'application/pdf'){
							getData = '<embed src="' + url + '" width="800px" height="2100px" />'
						}
					}
					else {
						getData = 'Attachment Not Found';
					}
				 

			    // let fileType = secPaymentProof.original.type;
			    // let subType = fileType.substring('0', '5');
			    // let base64 = waitBase64(secPaymentProof.url());
			    // if(subType == 'image') {
			    //   getData = '<img src="' + base64 + '" height="500px" /> ';
			    // } else if(fileType == 'application/pdf') {
			    //   let arrBase64 = waitPdfImg(secPaymentProof.url());
			    //   getData = '';
			    //   if(arrBase64 && arrBase64.length > 0) {
			    //     for (var index = 0; index < arrBase64.length; index++) {
			    //       getData += '<div><img src="' + arrBase64[index] + '" width="100%" /></div>'
			    //     }
			    //   }
			    // } else {
			    //   getData = '';
			    // }
			  }
			  break;
			case 'form_data.landlord_sign':
				getData = '<img src=' + getData + ' alt="" > ';
			break;
			// temporary case
			case 'toCurrency form_data.gfd_amount':
				if (objectFunction['currencyToNumber'](getData) !==report. objectByString(data, 'form_data.monthly_rental')) {
					getData = '<i class="marker">' + getData + '</i>';
				}
			break;
			case 'form_data.status_sign':
				getData =  'accept';
			break;
			case 'form_data.status' :
				let status ;
				if (getData == 'accepted') {
					status = 'accept / <strike>reject </strike>';
				}  
				else if (getData == 'rejected') {
					status = '<strike>accept </strike>/ reject ';
				} 
				else {
					status = null;
				}
				if (status) {
					getData = '<p class="text-center blue b i">ACCEPTANCE</p>';
					getData += '<p>I, the undersigned Landlord(s) of the above mentioned premises hereby * '+ status;
					getData += 'the offer by the Tenant to lease the premises based on the terms and conditions mentioned ';
					getData += 'in the Letter Of Intent and acknowledge receipt of the good faith deposit.</p>';
				}
				else {
					getData = '';
				}
			break;
			case 'form_data.confirmation_date' :
				// let currentDate = moment()._d;

				let years = moment(getData).format("YYYY")
				let month = moment(getData).format("MMMM")
				let day = moment(getData).format("DD")
				getData =  'Dated this '+ day+' day of '+month +' '+ years+'.';
			break;
		}
		} 
		else {
			switch (name) {
				case 'form_data.occupants':
					getData = '<li><table width="100%"><tr><td width="50%">Name: <i class="b">-</i></td>' +
					'<td>Passport/NRIC No: <i class="b">-</i></td></tr></table></li>';;
				break;
				case 'form_data.requirements':
					getData = '<li>No requirements</li>';
				break;
				case 'form_data.tenant_sign':
					getData = " Not signed";
				break;
				case 'form_data.landlord_sign':
					getData = " Not signed";
				break;
				case 'form_data.tenant.company_name':
					if (getData == undefined) {
						getData = "";
					}
				break;
				case 'form_data.status' :
					getData = '';
				break;
				case 'form_data.confirmation_date' :
					getData = '';
				break;
				case 'form_data.logo' :
				  getData = '<img src="https://staysmart.sg/lib/img/logo.png" alt="logo" /> ';
				break;
			}
		}
		replaced = submatch.replace(/<(?:(span|ol|))(.*)>([\s\S]*?)<\/(?:(span|ol|))>/, '<$1 $2>$3' + getData + '</$4>');
		string = string.replace(submatch, replaced);
		});
		
		// if(callback) { callback(null, string); }
		// return string;
		resolve(string);
		});
	}
	static objectByString(o, s){
		s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
		s = s.replace(/^\./, '');           // strip a leading dot
		var a = s.split('.');
		for (var i = 0, n = a.length; i < n; ++i) {
			var k = a[i];
			if (k in o) {
				o = o[k];
			} 
			else {
				return;
			}
		}
		return o;
	}	
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};