import * as express from "express";

export class Routes {
   static init(app: express.Application, router: express.Router) {
     app.use("/", router);
     app.use('/api/v1', require ('../api/v1/v1_route/index').default);
   }
}
