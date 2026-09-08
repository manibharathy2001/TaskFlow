import express from "express";

import { 
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getAllTasksForAdmin,
    getTaskByIdForAdmin,
    updateTaskForAdmin,
    deleteTaskForAdmin,
    getTaskStats,
    getTaskAnalytics,
    getAdminTaskStats
} from "../controllers/taskController.js";

import { validateRequest } from "../middleware/validationMiddleware.js";

import { 
    createTaskValidation,
    updateTaskValidation,
    taskIdValidation,
    getTasksValidation,
    getAdminTasksValidation
} from "../middleware/taskValidation.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeTask } from "../middleware/taskAuthorization.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";


const router = express.Router();


// Admin task routes
router
    .route("/admin")
    .get(
        protect,
        getAdminTasksValidation,
        validateRequest,
        authorizeRoles("admin"),
        getAllTasksForAdmin
    );

// Admin task statistics
router
    .route("/admin/stats")
    .get(
        protect,
        authorizeRoles("admin"),
        getAdminTaskStats
    );

router
    .route("/admin/:id")
    .get(
        protect,
        taskIdValidation,
        validateRequest,
        authorizeRoles("admin"),
        getTaskByIdForAdmin
    )
    .patch(
        protect,
        taskIdValidation,
        updateTaskValidation,
        validateRequest,
        authorizeRoles("admin"),
        updateTaskForAdmin
    )
    .delete(
        protect,
        taskIdValidation,
        validateRequest,
        authorizeRoles("admin"),
        deleteTaskForAdmin
    );

// Normal user task routes
router
    .route("/")
    .post(
        protect, 
        createTaskValidation, 
        validateRequest, 
        createTask
    )
    .get(
        protect,
        getTasksValidation,
        validateRequest, 
        getTasks
    );

// User task statistics
router
    .route("/stats")
    .get(
        protect,
        getTaskStats
    )

// Advanced user task analytics
router
    .route("/analytics")
    .get(
        protect,
        getTaskAnalytics
    );

// Normal user task routes by id
router
    .route("/:id")
    .get(
        protect,
        taskIdValidation, 
        validateRequest,
        authorizeTask, 
        getTaskById
    )
    .patch(
        protect, 
        updateTaskValidation, 
        validateRequest,
        authorizeTask, 
        updateTask
    )
    .delete(
        protect, 
        taskIdValidation, 
        validateRequest,
        authorizeTask, 
        deleteTask
    );

export default router;