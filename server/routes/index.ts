import * as express from "express";

export class Routes {
   static init(app: express.Application, router: express.Router) {
     app.use('/', require('../auth').default);
     app.use('/auth', require('../auth').default);
     app.use('/api/v2', require ('../api/v2/v2_route/index').default);
   }
}
