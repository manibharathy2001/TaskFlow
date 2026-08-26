import express from "express";

import { 
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/taskController.js";

import { validateRequest } from "../middleware/validationMiddleware.js";

import { 
    createTaskValidation,
    updateTaskValidation,
    taskIdValidation
} from "../middleware/taskValidation.js";

const router = express.Router();

router
    .route("/")
    .post(createTaskValidation, validateRequest, createTask)
    .get(getTasks);

router
    .route("/:id")
    .get(taskIdValidation, validateRequest, getTaskById)
    .patch(updateTaskValidation, validateRequest, updateTask)
    .delete(taskIdValidation, validateRequest, deleteTask);

export default router;