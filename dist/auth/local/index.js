'use strict';
var express = require("express");
var passport = require('passport');
var auth_service_1 = require("../auth-service");
var router = express.Router();
router.post('/', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        var error = err || info;
        if (error) {
            return res.status(401).json(error);
        }
        if (!user) {
            return res.status(404).json({ message: 'Something went wrong, please try again.' });
        }
        var token = auth_service_1.signToken(user._id, user.role, user.username);
        res.json({ token: token });
    })(req, res, next);
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=index.js.map