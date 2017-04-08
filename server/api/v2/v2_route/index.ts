import * as express from "express";
import {UserRoutes} from "../users/routes/users-routes";
import {BlogCategoriesRoutes} from "../blog_categories/routes/blog_categories-routes";
import {FaqsRoutes} from "../faqs/routes/faqs-routes";
import {BanksRoutes} from "../banks/routes/banks-routes";
import {ChatsRoutes} from "../chats/routes/chats-routes";
import {PaymentsRoutes} from "../payments/routes/payments-routes";
import {AmenitiesRoutes} from "../amenities/routes/amenities-routes";
import {BlogsRoutes} from "../blogs/routes/blogs-routes";
import {AttachmentsRoutes} from "../attachments/routes/attachments-routes";
import {NotificationsRoutes} from "../notifications/routes/notifications-routes";
import {CompaniesRoutes} from "../companies/routes/companies-routes";
import {CommentsRoutes} from "../comments/routes/comments-routes";
import {DevelopmentsRoutes} from "../developments/routes/developments-routes";
import {PropertiesRoutes} from "../properties/routes/properties-routes";
import {AppointmentsRoutes} from "../appointments/routes/appointments-routes";
import {AgreementsRoutes} from "../agreements/routes/agreements-routes";
import {ManagersRoutes} from "../managers/routes/managers-routes";
import {ReportRoutes} from "../report/routes/report-routes";
import {UserReportsRoutes} from "../user_reports/routes/user_reports-routes";

var router = express.Router();

UserRoutes.init(router);

FaqsRoutes.init(router);
BlogsRoutes.init(router);
BanksRoutes.init(router);
ChatsRoutes.init(router);
ReportRoutes.init(router);
PaymentsRoutes.init(router);
CommentsRoutes.init(router);
ManagersRoutes.init(router);
AmenitiesRoutes.init(router);
CompaniesRoutes.init(router);
PropertiesRoutes.init(router);
AgreementsRoutes.init(router);
AttachmentsRoutes.init(router);
UserReportsRoutes.init(router);
AppointmentsRoutes.init(router);
DevelopmentsRoutes.init(router);
NotificationsRoutes.init(router);
BlogCategoriesRoutes.init(router);


export default router;