import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try{
        // Get Authorization header
        const authHeader = req.headers.authorization;
        
        // Check if token exists
        if(!authHeader){
            return res.status(401).json({
                message: "Access Denied. No Token Provided"
            });
        }

        // Check Bearer format
        if(!authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                message: "Invalid Authorization Format"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Check if token exists
        if(!token){
            return res.status(401).json({
                message: "Access Denied. Token is missing"
            });
        }

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT secret is not configured"
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find current user from database
        const user = await User.findById(decoded.userId)
            .select("_id role isActive");

        // User no longer exists
        if(!user){
            return res.status(401).json({
                message: "User account no longer exists"
            });
        }

        // User account has been deactivated
        if(!user.isActive){
            return res.status(403).json({
                message: "User account is inactive"
            });
        }

        // Attach current database user information
        req.user = {
            userId: user._id,
            role: user.role
        };

        // Continue to next middleware/controller
        next();

    } catch(error){
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};