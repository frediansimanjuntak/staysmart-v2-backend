"use strict";
var Routes = (function () {
    function Routes() {
    }
    Routes.init = function (app, router) {
        app.use("/", router);
        app.use('/auth', require('../auth').default);
        app.use('/api/v1', require('../api/v1/v1_route/index').default);
    };
    return Routes;
}());
exports.Routes = Routes;
//# sourceMappingURL=index.js.map