import * as express from "express";
import {TodoRoutes} from "../api/todo/route/todo-route";
import {UserRoutes} from "../api/users/routes/users-routes";
import {BlogCategoriesRoutes} from "../api/blog_categories/routes/blog_categories-routes";


export class Routes {
   static init(app: express.Application, router: express.Router) {
     TodoRoutes.init(router);
     UserRoutes.init(router);
     BlogCategoriesRoutes.init(router);
     

     app.use("/", router);
   }
}
