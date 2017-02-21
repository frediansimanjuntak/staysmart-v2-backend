"use strict";
var express = require("express");
var users_routes_1 = require("../users/routes/users-routes");
var blog_categories_routes_1 = require("../blog_categories/routes/blog_categories-routes");
var faqs_routes_1 = require("../faqs/routes/faqs-routes");
var banks_routes_1 = require("../banks/routes/banks-routes");
var payments_routes_1 = require("../payments/routes/payments-routes");
var amenities_routes_1 = require("../amenities/routes/amenities-routes");
var router = express.Router();
users_routes_1.UserRoutes.init(router);
blog_categories_routes_1.BlogCategoriesRoutes.init(router);
faqs_routes_1.FaqsRoutes.init(router);
banks_routes_1.BanksRoutes.init(router);
payments_routes_1.PaymentsRoutes.init(router);
amenities_routes_1.AmenitiesRoutes.init(router);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
//# sourceMappingURL=index.js.map