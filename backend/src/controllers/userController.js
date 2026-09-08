import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Task from "../models/Task.js";

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

// Get current logged-in user's profile
export const getCurrentUser = async (req, res, next) => {
    try{
        // after protect middleware we can access req.user.userId
        const user = await User.findById(req.user.userId)
            .select("-password");

        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user
            }
        });
    } catch(error){
        next(error);
    }
};

// Update current logged-in user's profile
export const updateCurrentUser = async (req, res, next) => {
    try{
        const { name, email } = req.body;

        // Build update object
        const updates = {};

        if(name !== undefined){
            updates.name = name;
        }

        if(email !== undefined){
            updates.email = email.trim().toLowerCase();
        }

        // Check whether there is anything to update
        if(Object.keys(updates).length === 0){
            return res.status(400).json({
                success: false,
                message: "No profile fields provided for update"
            });
        }

        // Check whether another user already uses the email
        if(updates.email){
            const existingUser = await User.findOne({
                email: updates.email,
                _id: { $ne: req.user.userId }
            });

            if(existingUser){
                return res.status(409).json({
                    success: false,
                    message: "Email is already in use"
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updates,
            {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user
            }
        });
    } catch(error){
        next(error);
    }
}

// Change current logged-in user's password
export const changePassword = async (req, res, next) => {
    try{
        const {
            currentPassword,
            newPassword
        } = req.body;

        // Check required fields
        if(!currentPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        // Prevent using the same password
        if(currentPassword === newPassword){
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        // Find logged-in user and explicitly include password
        const user = await User.findById(req.user.userId)
            .select("+password");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check whether account is active
        if(!user.isActive){
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        // Verify current password
        const isCurrentPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if(!isCurrentPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch(error){
        next(error);
    }
}

// Admin - Get any user by ID
export const getUserByIdForAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user
            }
        });
    } catch(error){
        next(error);
    }
};

// Admin - Get all users with pagination, search, filtering and sorting
export const getUsersForAdmin = async (req, res, next) => {
    try {
        const {
            search,
            role,
            isActive,
            sort = "-createdAt"
        } = req.query;

        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Build filter
        const filter = {};

        // Search by name or email
        if(search){
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                {
                    name: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                }
            ];
        }

        // Filter by role
        if(role){
            filter.role = role;
        }

        // Filter by account status
        if(isActive !== undefined){
            filter.isActive = isActive === "true";
        }

        // Convert sort query into MongoDB sort object
        const sortField = sort.startsWith("-")
            ? sort.substring(1)
            : sort;

        const sortDirection = sort.startsWith("-")
            ? -1
            : 1;

        const sortOptions = {
            [sortField]: sortDirection
        };

        // Get total matching users
        const totalUsers = await User.countDocuments(filter);

        // Get paginated users
        const users = await User.find(filter)
            .select("-password")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        // Calculate total pages
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            success: true,
            count: users.length,
            pagination: {
                currentPage: page,
                limit,
                totalUsers,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            data: {
                users
            }
        });
    } catch(error){
        next(error);
    }
};


// Admin - Update user's role
export const updateUserRoleForAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Prevent admin from changing their own role
        if(id === req.user.userId.toString()){
            return res.status(400).json({
                success: false,
                message: "You cannot change your own role"
            });
        }

        // Prevent removing the last admin
        if(role === "user"){
            const targetUser = await User.findById(id).select("role");

            if(!targetUser){
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if(targetUser.role === "admin"){
                const adminCount = await User.countDocuments({
                    role: "admin",
                    isActive: true,
                    _id: { $ne: id }
                });

                if(adminCount === 0){
                    return res.status(400).json({
                        success: false,
                        message: "You cannot remove the last active admin"
                    });
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            id,
            {
                role
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: {
                user
            }
        });
    } catch(error){
        next(error);
    }
};


// Admin - Activate or deactivate user account
export const updateUserStatusForAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Prevent admin from deactivating their own account
        if(id === req.user.userId.toString() && isActive === false){
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account"
            });
        }

        // Prevent deactivating the last active admin
        if(isActive === false){
            const targetUser = await User.findById(id).select("role");

            if(!targetUser){
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            if(targetUser.role === "admin"){
                const activeAdminCount = await User.countDocuments({
                    role: "admin",
                    isActive: true
                });

                if(activeAdminCount <= 1){
                    return res.status(400).json({
                        success: false,
                        message: "You cannot deactivate the last active admin"
                    });
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            id,
            {
                isActive
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        ).select("-password");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: isActive
                ? "User account activated successfully"
                : "User account deactivated successfully",
            data: {
                user
            }
        });
    } catch(error){
        next(error);
    }
};


// Admin - Delete any user and all associated tasks
export const deleteUserForAdmin = async (req, res, next) => {
    //MongoDB uses session to track the transaction
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;

        // Prevent admin from deleting their own account
        if(id === req.user.userId.toString()){
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        // Start transaction - from this, the operations are part of one transaction
        session.startTransaction();

        // Check whether user exists
        const targetUser = await User.findById(id)
            .select("role isActive")
            .session(session);

        if(!targetUser){
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent deletion of the last active admin
        if(targetUser.role === "admin" && targetUser.isActive){
            const activeAdminCount = await User.countDocuments({
                role: "admin",
                isActive: true
            }).session(session);

            if(activeAdminCount <= 1){
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: "You cannot delete the last active admin"
                });
            }
        }

        // Delete all tasks belonging to this user
        const taskDeleteResult = await Task.deleteMany(
            { user: id },
            { session }
        );

        // Delete the user
        await User.findByIdAndDelete(id, { session });

        // Commit transaction
        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "User and associated tasks deleted successfully",
            data: {
                deletedUserId: id,
                deletedTasksCount: taskDeleteResult.deletedCount
            }
        });

    } catch(error){
        // Rollback transaction if anything fails
        if(session.inTransaction()){
            await session.abortTransaction();
        }

        next(error);

    } finally{
        // Always close the session
        await session.endSession();
    }
};