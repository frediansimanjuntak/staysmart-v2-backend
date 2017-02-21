import * as express from "express";
import {UserRoutes} from "../users/routes/users-routes";
import {BlogCategoriesRoutes} from "../blog_categories/routes/blog_categories-routes";
import {FaqsRoutes} from "../faqs/routes/faqs-routes";
import {BanksRoutes} from "../banks/routes/banks-routes";
import {PaymentsRoutes} from "../payments/routes/payments-routes";
import {AmenitiesRoutes} from "../amenities/routes/amenities-routes";
import {BlogsRoutes} from "../blogs/routes/blogs-routes";
import {AttachmentsRoutes} from "../attachments/routes/attachments-routes";
import {NotificationsRoutes} from "../notifications/routes/notifications-routes";
import {CompaniesRoutes} from "../companies/routes/companies-routes";
import {DevelopmentsRoutes} from "../developments/routes/developments-routes";
import {PropertiesRoutes} from "../properties/routes/properties-routes";
import {AppointmentsRoutes} from "../appointments/routes/appointments-routes";
import {AgreementsRoutes} from "../agreements/routes/agreements-routes";

var router = express.Router();

UserRoutes.init(router);
BlogCategoriesRoutes.init(router);
FaqsRoutes.init(router);
BanksRoutes.init(router);
PaymentsRoutes.init(router);
AmenitiesRoutes.init(router);
BlogsRoutes.init(router);
AttachmentsRoutes.init(router);
NotificationsRoutes.init(router);
CompaniesRoutes.init(router);
DevelopmentsRoutes.init(router);
PropertiesRoutes.init(router);
AppointmentsRoutes.init(router);
AgreementsRoutes.init(router);

export default router;