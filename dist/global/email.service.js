'use strict';
var Promise = require("bluebird");
var index_1 = require("../config/environment/index");
var global_service_1 = require("./global.service");
// Access https://github.com/bojand/mailgun-js for documentation
var mailgun = require('mailgun-js')({ apiKey: index_1.default.mailgun.apiKey, domain: index_1.default.mailgun.domain });
var EmailConfig = (function () {
    function EmailConfig() {
    }
    EmailConfig.init = function () {
        var _root = process.cwd();
    };
    return EmailConfig;
}());
exports.EmailConfig = EmailConfig;
var EmailService = (function () {
    function EmailService() {
    }
    EmailService.sendEmail = function (emailTo, emailSubject, emailText) {
        return new Promise(function (resolve, reject) {
            if (!global_service_1.GlobalService.validateEmail(emailTo))
                reject(new TypeError('Destination email is not a valid email.'));
            var data = {
                from: 'Staysmart Revamp <noreply@mcst.com.sg>',
                to: emailTo,
                subject: emailSubject,
                text: emailText
            };
            mailgun.messages().send(data, function (error, body) {
                if (error)
                    reject(error);
                resolve(body);
            });
        });
    };
    return EmailService;
}());
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map