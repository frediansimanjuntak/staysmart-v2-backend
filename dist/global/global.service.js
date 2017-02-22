'use strict';
var GlobalService = (function () {
    function GlobalService() {
    }
    GlobalService.init = function () {
        var _root = process.cwd();
    };
    GlobalService.initGlobalFunction = function () {
        String.prototype.indexOfEnd = function (string) {
            var io = this.indexOf(string);
            return io == -1 ? -1 : io + string.length;
        };
        String.prototype.lastIndexOfEnd = function (string) {
            var io = this.lastIndexOf(string);
            return io == -1 ? -1 : io + string.length;
        };
    };
    GlobalService.validateEmail = function (email) {
        var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return reg.test(email);
    };
    GlobalService.validateObjectId = function (id) {
        var patt = new RegExp("^[0-9a-fA-F]{24}$");
        return patt.test(id);
    };
    return GlobalService;
}());
exports.GlobalService = GlobalService;
//# sourceMappingURL=global.service.js.map