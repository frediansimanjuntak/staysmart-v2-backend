/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */
'use strict';
var users_dao_1 = require("../api/v1/users/dao/users-dao");
users_dao_1.default
    .find({})
    .then(function () {
    users_dao_1.default.create({
        provider: 'local',
        username: 'master',
        password: 'master',
        email: 'master@master.com',
        role: 'user',
    })
        .then(function () {
        console.log('finished populating users');
    });
});
//# sourceMappingURL=seed.js.map