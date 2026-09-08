import { body, param, query } from "express-validator";

// Validate user ID
export const userIdValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid user ID")
];


// Validate admin role update
export const updateUserRoleValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid user ID"),

    body("role")
        .isIn(["user", "admin"])
        .withMessage("Role must be either user or admin")
];


// Validate admin account status update
export const updateUserStatusValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid user ID"),

    body("isActive")
        .isBoolean()
        .toBoolean()
        .withMessage("isActive must be a boolean")
];


// Validate admin user listing
export const getUsersAdminValidation = [
    query("search")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Search must be between 1 and 100 characters"),

    query("role")
        .optional()
        .isIn(["user", "admin"])
        .withMessage("Role must be either user or admin"),

    query("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("sort")
        .optional()
        .isIn([
            "name",
            "-name",
            "email",
            "-email",
            "createdAt",
            "-createdAt",
            "role",
            "-role"
        ])
        .withMessage("Invalid sort field")
];