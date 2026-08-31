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

import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router
    .route("/")
    .post(protect, createTaskValidation, validateRequest, createTask)
    .get(protect, getTasks);

router
    .route("/:id")
    .get(protect, taskIdValidation, validateRequest, getTaskById)
    .patch(protect, updateTaskValidation, validateRequest, updateTask)
    .delete(protect, taskIdValidation, validateRequest, deleteTask);

export default router;