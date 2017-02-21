import * as express from "express";
import {UserRoutes} from "../users/routes/users-routes";
import {BlogCategoriesRoutes} from "../blog_categories/routes/blog_categories-routes";
import {FaqsRoutes} from "../faqs/routes/faqs-routes";
import {BanksRoutes} from "../banks/routes/banks-routes";
import {PaymentsRoutes} from "../payments/routes/payments-routes";
import {AmenitiesRoutes} from "../amenities/routes/amenities-routes";
import {BlogsRoutes} from "../blogs/routes/blogs-routes";
import {AttachmentsRoutes} from "../attachments/routes/attachments-routes";

var router = express.Router();

UserRoutes.init(router);
BlogCategoriesRoutes.init(router);
FaqsRoutes.init(router);
BanksRoutes.init(router);
PaymentsRoutes.init(router);
AmenitiesRoutes.init(router);
BlogsRoutes.init(router);
AttachmentsRoutes.init(router);

export default router;