import * as express from "express";
import {TodoRoutes} from "../api/todo/route/todo-route";


export class Routes {
   static init(app: express.Application, router: express.Router) {
     TodoRoutes.init(router);
     

     app.use("/", router);
   }
}
