import express from "express";
import { 
    registerUser,
    loginUser
} from "../controllers/userController.js";

// Create the router
const router = express.Router();

// Define the registration route
router.post("/register", registerUser);

router.post("/login", loginUser);

export default router;