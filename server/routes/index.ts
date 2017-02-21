import * as express from "express";
import {TodoRoutes} from "../api/todo/route/todo-route";
import {UserRoutes} from "../api/users/routes/users-routes";
import {BlogCategoriesRoutes} from "../api/blog_categories/routes/blog_categories-routes";
import {FaqsRoutes} from "../api/faqs/routes/faqs-routes";
import {BanksRoutes} from "../api/banks/routes/banks-routes";


export class Routes {
   static init(app: express.Application, router: express.Router) {
     TodoRoutes.init(router);
     UserRoutes.init(router);
     BlogCategoriesRoutes.init(router);
     FaqsRoutes.init(router);
     BanksRoutes.init(router);
     

     app.use("/", router);
   }
}
