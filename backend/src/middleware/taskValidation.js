import { body, param } from "express-validator";

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
    
    body("userId")
        .notEmpty()
        .withMessage("User ID is required")
        .isMongoId()
        .withMessage("Invalid user ID")
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