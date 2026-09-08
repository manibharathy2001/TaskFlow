import { body, param, query } from "express-validator";

export const createTaskValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Task title is required")
        .isLength({ min:2, max:100 })
        .withMessage("Task title must be between 2 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max:500 })
        .withMessage("Task description cannot exceed 500 characters"),

    body("status")
        .optional()
        .isIn(["todo", "in-progress", "completed"])
        .withMessage("Invalid task status"),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high"])
        .withMessage("Invalid task priority"),

    body("dueDate")
        .optional()
        .isISO8601()
        .withMessage("Due date must be a valid date"),
];

export const updateTaskValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid task ID"),
    
    body("title")
        .optional()
        .trim()
        .isLength({ min:2, max:100 })
        .withMessage("Task title must be between 2 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Task description cannot exceed 500 characters"),

    body("status")
        .optional()
        .isIn(["todo", "in-progress", "completed"])
        .withMessage("Invalid task status"),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high"])
        .withMessage("Invalid task priority"),

    body("dueDate")
        .optional()
        .isISO8601()
        .withMessage("Due date must be a valid date"),
];

export const taskIdValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid task ID")
];

export const getTasksValidation = [
    query("status")
        .optional()
        .isIn(["todo", "in-progress", "completed"])
        .withMessage("Invalid task status"),

    query("priority")
        .optional()
        .isIn(["low", "medium", "high"])
        .withMessage("Invalid task priority"),

    query("search")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Search must be between 1 and 100 characters"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("dueAfter")
        .optional()
        .isISO8601()
        .withMessage("dueAfter must be a valid date"),

    query("dueBefore")
        .optional()
        .isISO8601()
        .withMessage("dueBefore must be a valid date")
        .custom((value, { req }) => {
            if (
                req.query.dueAfter &&
                new Date(value) < new Date(req.query.dueAfter)
            ) {
                throw new Error("dueBefore must be greater than or equal to dueAfter");
            }

            return true;
        }),

    query("sort")
        .optional()
        .isIn([
            "createdAt",
            "-createdAt",
            "dueDate",
            "-dueDate",
            "priority",
            "-priority",
            "status",
            "-status",
            "title",
            "-title"
        ])
        .withMessage("Invalid sort field")
];

export const getAdminTasksValidation = [
    query("status")
        .optional()
        .isIn(["todo", "in-progress", "completed"])
        .withMessage("Invalid task status"),

    query("priority")
        .optional()
        .isIn(["low", "medium", "high"])
        .withMessage("Invalid task priority"),

    query("search")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Search must be between 1 and 100 characters"),

    query("userId")
        .optional()
        .isMongoId()
        .withMessage("Invalid user ID"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("dueAfter")
        .optional()
        .isISO8601()
        .withMessage("dueAfter must be a valid date"),

    query("dueBefore")
        .optional()
        .isISO8601()
        .withMessage("dueBefore must be a valid date")
        .custom((value, { req }) => {
            if (
                req.query.dueAfter &&
                new Date(value) < new Date(req.query.dueAfter)
            ) {
                throw new Error("dueBefore must be greater than or equal to dueAfter");
            }

            return true;
        }),

    query("sort")
        .optional()
        .isIn([
            "createdAt",
            "-createdAt",
            "dueDate",
            "-dueDate",
            "priority",
            "-priority",
            "status",
            "-status",
            "title",
            "-title"
        ])
        .withMessage("Invalid sort field")
];