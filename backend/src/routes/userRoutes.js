import express from "express";
import { registerUser } from "../controllers/userController.js";

// Create the router
const router = express.Router();

// Define the registration route
router.post("/register", registerUser);

export default router;