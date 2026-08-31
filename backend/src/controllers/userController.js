import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register a new user
export const registerUser = async (req, res, next) => {
    try{
        const {
            name,
            email,
            password
        } = req.body;

        const normalizedEmail = email?.trim().toLowerCase();

        // Check required fields
        if(!name || !normalizedEmail || !password){
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if(existingUser){
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        // Send response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch(error){
        next(error);
    }
};

// Login existing user
export const loginUser = async (req, res, next) => {
    try{
        const { email, password } = req.body;

        const normalizedEmail = email?.trim().toLowerCase();

        // Check required fields
        if(!normalizedEmail || !password){
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user by email and include password hash
        const user = await User.findOne({
            email: normalizedEmail
        }).select("+password");

        if(!user){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check if account is active
        if(!user.isActive){
            return res.status(403).json({
                message: "Account is inactive"
            });
        }

        // Compare password with stored hash
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if(!isPasswordCorrect){
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check JWT secret
        if(!process.env.JWT_SECRET){
            return res.status(500).json({
                message: "JWT secret is not configured"
            });
        }

        // Generate JWT -> jwt.sign(payload, secret, options)
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Send response
        res.status(200).json({
            message: "Login successful",
            token
        });
    } catch(error){
        next(error);
    }
}