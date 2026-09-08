import express from "express";
import { 
    registerUser,
    loginUser,
    getCurrentUser,
    updateCurrentUser,
    changePassword,
    getUserByIdForAdmin,
    getUsersForAdmin,
    updateUserRoleForAdmin,
    updateUserStatusForAdmin,
    deleteUserForAdmin
} from "../controllers/userController.js";

import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
    userIdValidation,
    updateUserRoleValidation,
    updateUserStatusValidation,
    getUsersAdminValidation
} from "../middleware/userValidation.js";

import { validateRequest } from "../middleware/validationMiddleware.js";

import { protect } from "../middleware/authMiddleware.js";


// Create the router
const router = express.Router();

// Define the registration route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Admin - Get all users
router.get(
    "/admin",
    protect,
    getUsersAdminValidation,
    validateRequest,
    authorizeRoles("admin"),
    getUsersForAdmin
);

// Admin - Get any user
router.get(
    "/admin/:id",
    protect,
    userIdValidation,
    validateRequest,
    authorizeRoles("admin"),
    getUserByIdForAdmin
);

// Admin - Update user role
router.patch(
    "/admin/:id/role",
    protect,
    updateUserRoleValidation,
    validateRequest,
    authorizeRoles("admin"),
    updateUserRoleForAdmin
);

// Admin - Activate/deactivate user
router.patch(
    "/admin/:id/status",
    protect,
    updateUserStatusValidation,
    validateRequest,
    authorizeRoles("admin"),
    updateUserStatusForAdmin
);

// Admin - Delete user
router.delete(
    "/admin/:id",
    protect,
    userIdValidation,
    validateRequest,
    authorizeRoles("admin"),
    deleteUserForAdmin
);

// Get current logged-in user's profile
router.get("/me", protect, getCurrentUser);

// Update current logged-in user's profile
router.patch("/me", protect, updateCurrentUser);

// Change current logged-in user's password
router.patch("/change-password", protect, changePassword);

export default router;