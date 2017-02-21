"use strict";

import * as express from "express";
import {TodoController} from "../controller/todo-controller";

export class TodoRoutes {
    static init(router: express.Router) {
      router
        .route("/todos")
        .get(TodoController.getAll)
        .post(TodoController.createTodo);

      router
        .route("/todos/:id")
        .delete(TodoController.deleteTodo);
    }
}
