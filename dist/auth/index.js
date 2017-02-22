'use strict';
var express = require("express");
var index_1 = require("../config/environment/index");
var users_dao_1 = require("../api/v1/users/dao/users-dao");
// console.log(User);
// Passport Configuration
require('./local/passport').setup(users_dao_1.default, index_1.default);
var router = express.Router();
router.use('/local', require('./local').default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=index.js.map