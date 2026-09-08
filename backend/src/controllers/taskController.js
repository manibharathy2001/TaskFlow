import mongoose from "mongoose";
import Task from "../models/Task.js";

// This prevents user-provided search text from being interpreted as a regular expression
const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Create task
export const createTask = async (req, res, next) => {
    try{
        const {
            title,
            description,
            status,
            priority,
            dueDate
        } = req.body;

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            completedAt: status === "completed" ? new Date() : null,
            user: req.user.userId, //from protect middleware
        });

        await task.populate("user", "name email");

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: {
                task
            }
        });
    } catch(error){
        next(error);
    }
};

// Get tasks with filtering, searching, pagination, date filtering and sorting
export const getTasks = async (req, res, next) => {
    try{
        const {
            status,
            priority,
            search,
            dueAfter,
            dueBefore,
            sort = "-createdAt"
        } = req.query;

        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Always restrict tasks to logged-in user
        const filter = {
            user: req.user.userId
        };

        // Filter by status
        if(status){
            filter.status = status;
        }

        // Filter by priority
        if(priority){
            filter.priority = priority;
        }

        // Search title or description
        if(search){
            const escapedSearch = escapeRegex(search);

            filter.$or = [
                {
                    title: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                }
            ];
        }

        // Filter tasks due after & before a specific date
        if (dueAfter || dueBefore) {
            filter.dueDate = {};

            if (dueAfter) {
                filter.dueDate.$gte = new Date(dueAfter);
            }

            if (dueBefore) {
                filter.dueDate.$lte = new Date(dueBefore);
            }
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

        // Get total number of matching tasks
        const totalTasks = await Task.countDocuments(filter);

        // Get paginated tasks
        const tasks = await Task.find(filter)
            .populate("user", "name email")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        
        const totalPages = Math.ceil(totalTasks / limit);

        res.status(200).json({
            success: true,
            count: tasks.length,
            pagination: {
                currentPage: page,
                limit,
                totalTasks,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            data: {
                tasks
            }
        });
    } catch(error){
        next(error);
    }
};

// Get one task
export const getTaskById = async (req, res, next) => {
    try{
        const { id } = req.params;

        // MongoDB checks both task_ID and logged-in user
        const task = await Task.findOne({
            _id: id,
            user: req.user.userId
        }).populate("user", "name email");

        if(!task){
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                task
            }
        });
    } catch(error){
        next(error);
    }
};

// Update the task 
export const updateTask = async (req, res, next) => {
    try{
        const { id } = req.params;

        const {
            title,
            description,
            status,
            priority,
            dueDate
        } = req.body;

        const updates = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;
        if (priority !== undefined) updates.priority = priority;
        if (dueDate !== undefined) updates.dueDate = dueDate;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update the task"
            });
        }

        if (status === "completed") {
            if (req.task.status !== "completed") {
                updates.completedAt = new Date();
            }
        } else if (status !== undefined) {
            updates.completedAt = null;
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: id,
                user: req.user.userId
            },
            updates,
            {
                returnDocument: "after", // return the updated
                runValidators: true
            }
        ).populate("user", "name email");
        
        if(!task){
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        
        // populate user but only name & email
        await task.populate("user", "name email");

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: {
                task
            }
        });
    } catch(error){
        next(error);
    }
};

// Delete the task
export const deleteTask = async (req, res, next) => {
    try{
        const { id } = req.params;

        const task = await Task.findOneAndDelete({
            _id: id,
            user: req.user.userId
        });

        if(!task){
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch(error){
        next(error);
    }
};

// Admin - Get all tasks
export const getAllTasksForAdmin = async (req, res, next) => {
    try{
        const {
            status,
            priority,
            search,
            userId,
            dueAfter,
            dueBefore,
            page = 1,
            limit = 10,
            sort = "-createdAt"
        } = req.query;

        // Build query
        const query = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by priority
        if (priority) {
            query.priority = priority;
        }

        // Filter by user
        if (userId) {
            query.user = userId;
        }

        // Search title and description
        if (search) {
            const escapedSearch = escapeRegex(search);

            query.$or = [
                {
                    title: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                }
            ];
        }

        // Filter by due date range
        if (dueAfter || dueBefore) {
            query.dueDate = {};

            if (dueAfter) {
                query.dueDate.$gte = new Date(dueAfter);
            }

            if (dueBefore) {
                query.dueDate.$lte = new Date(dueBefore);
            }
        }

        // Pagination
        const currentPage = Number(page);
        const pageLimit = Number(limit);
        const skip = (currentPage - 1) * pageLimit;

        // Sorting
        const sortOptions = {};

        const sortField = sort.startsWith("-")
            ? sort.substring(1)
            : sort;

        const sortOrder = sort.startsWith("-") ? -1 : 1;

        sortOptions[sortField] = sortOrder;

        // Get tasks and total count
        const [tasks, totalTasks] = await Promise.all([
            Task.find(query)
                .populate("user", "name email")
                .sort(sortOptions)
                .skip(skip)
                .limit(pageLimit),

            Task.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalTasks / pageLimit);

        res.status(200).json({
            success: true,
            count: tasks.length,
            pagination: {
                currentPage,
                limit: pageLimit,
                totalTasks,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            },
            data: {
                tasks
            }
        });

    } catch(error){
        next(error);
    }
};

// Admin - Get any task
export const getTaskByIdForAdmin = async (req, res, next) => {
    try{
        const { id } = req.params;

        const task = await Task.findById(id)
            .populate("user", "name email");
        
        if(!task){
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                task
            }
        });
    } catch(error){
        next(error);
    }
};

// Admin - Update any task
export const updateTaskForAdmin = async (req, res, next) => {
    try{
        const { id } = req.params;

        const {
            title,
            description,
            status,
            priority,
            dueDate
        } = req.body;

        const updates = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;
        if (priority !== undefined) updates.priority = priority;
        if (dueDate !== undefined) updates.dueDate = dueDate;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update the task"
            });
        }

        const existingTask = await Task.findById(id);

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (status === "completed") {
            if (existingTask.status !== "completed") {
                updates.completedAt = new Date();
            }
        } else if (status !== undefined) {
            updates.completedAt = null;
        }

        const task = await Task.findByIdAndUpdate(
            id,
            updates,
            {
                returnDocument: "after",
                runValidators: true
            }
        ).populate("user", "name email");

        res.status(200).json({
            success: true,
            message: "Task updated successfully by admin",
            data: {
                task
            }
        });
    } catch(error){
        next(error);
    }
}

// Admin - Delete any task
export const deleteTaskForAdmin = async (req, res, next) => {
    try{
        const { id } = req.params;

        const task = await Task.findByIdAndDelete(id);

        if(!task){
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully by admin"
        });
    } catch(error){
        next(error)
    }
};

// Get task statistics for logged-in user
export const getTaskStats = async (req, res, next) => {
    try{
        const userId = req.user.userId;

        const stats = await Task.aggregate([
            // Only include tasks belonging to logged-in user
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId)
                }
            },

            // Calculate statistics
            {
                $group: {
                    _id: null,

                    totalTasks: {
                        $sum: 1
                    },

                    todo: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "todo"] },
                                1,
                                0
                            ]
                        }
                    },

                    inProgress: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "in-progress"]},
                                1,
                                0
                            ]
                        }
                    },

                    completed: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "completed"]},
                                1,
                                0
                            ]
                        }
                    },

                    lowPriority: {
                        $sum: {
                            $cond: [
                                { $eq: ["$priority", "low"] },
                                1,
                                0
                            ]
                        }
                    },

                    mediumPriority: {
                        $sum: {
                            $cond: [
                                { $eq: ["$priority", "medium"] },
                                1,
                                0
                            ]
                        }
                    },

                    highPriority: {
                        $sum: {
                            $cond: [
                                { $eq: ["$priority", "high"] },
                                1,
                                0
                            ]
                        }
                    },

                    overdue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ["$dueDate", null] },
                                        { $lt: ["$dueDate", new Date()] },
                                        { $ne: ["$status", "completed"] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },

            // Remove MongoDB's _id from response
            {
                $project: {
                    _id: 0,
                    totalTasks: 1,
                    todo: 1,
                    inProgress: 1,
                    completed: 1,
                    lowPriority: 1,
                    mediumPriority: 1,
                    highPriority: 1,
                    overdue: 1
                }
            }
        ]);

        // If user has no tasks, return zero statistics
        const taskStats = stats[0] || {
            totalTasks: 0,
            todo: 0,
            inProgress: 0,
            completed: 0,
            lowPriority: 0,
            mediumPriority: 0,
            highPriority: 0,
            overdue: 0
        };

        res.status(200).json({
            success: true,
            data: {
                stats: taskStats
            }
        });
    } catch(error){
        next(error);
    }
};

// Advanced analytics for logged-in user
export const getTaskAnalytics = async (req, res, next) => {
    try{
        const userId = new mongoose.Types.ObjectId(req.user.userId);

        const now = new Date();

        // Startof today
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        // Start of tomorrow
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        // Start of 7 days ago
        const thirtyDaysAgo = new Date(startOfToday);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 7 days from today
        const sevenDaysFromNow = new Date(startOfTomorrow);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const analytics = await Task.aggregate([
            // Only tasks belonging to logged-in user
            {
                $match: {
                    user: userId
                }
            },
            {
                $facet: {
                    // -----------------------------------------
                    // 1. Overall Summary
                    // -----------------------------------------
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalTasks: { $sum: 1 },

                                completedTasks: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$status", "completed"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                pendingTasks: {
                                    $sum: {
                                        $cond: [
                                            { $ne: ["$status", "completed"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                overdueTasks: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $ne: ["$dueDate", null] },
                                                    { $lt: ["$dueDate", now] },
                                                    { $ne: ["$status", "completed"] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                dueToday: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$dueDate", startOfToday] },
                                                    { $lt: ["$dueDate", startOfTomorrow] },
                                                    { $ne: ["$status", "completed"] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                dueNext7Days: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$dueDate", startOfTomorrow] },
                                                    { $lt: ["$dueDate", sevenDaysFromNow] },
                                                    { $ne: ["$status", "completed"] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                // Calculate average completion time
                                // in milliseconds
                                totalCompletionTime: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$status", "completed"] },
                                                    { $ne: ["$completedAt", null] }
                                                ]
                                            },
                                            {
                                                $subtract: [
                                                    "$completedAt",
                                                    "$createdAt"
                                                ]
                                            },
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    // -----------------------------------------
                    // 2. Status Distribution
                    // -----------------------------------------
                    statusDistribution: [
                        {
                            $group: {
                                _id: "$status",
                                count: {
                                    $sum: 1 
                                }
                            }
                        },
                        {
                            $sort: {
                                count: -1
                            }
                        }
                    ],

                    // -----------------------------------------
                    // 3. Priority Distribution
                    // -----------------------------------------
                    priorityDistribution: [
                        {
                            $group: {
                                _id: "$priority",
                                count: {
                                    $sum: 1 
                                }
                            }
                        },
                        {
                            $sort: {
                                count: -1
                            }
                        }
                    ],

                     // -----------------------------------------
                    // 4. Completion Trend - Last 30 Days
                    // -----------------------------------------
                    completionTrend: [
                        {
                            $match: {
                                status: "completed",
                                completedAt: {
                                    $ne: null,
                                    $gte: thirtyDaysAgo
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: "%Y-%m-%d",
                                        date: "$completedAt"
                                    }
                                },
                                completed: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const result = analytics[0];

        const summary = result.summary[0] || {
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            overdueTasks: 0,
            dueToday: 0,
            dueNext7Days: 0,
            totalCompletionTime: 0
        };

         // -----------------------------------------
        // Completion Rate
        // -----------------------------------------
        const completionRate = summary.totalTasks === 0
            ? 0
            : Number(
                (
                    (summary.completedTasks / summary.totalTasks) * 100
                ).toFixed(2)
            );

        // -----------------------------------------
        // Overdue Rate
        // -----------------------------------------
        const overdueRate = summary.totalTasks === 0
            ? 0
            : Number(
                (
                    (summary.overdueTasks / summary.totalTasks) * 100
                ).toFixed(2)
            );

        // -----------------------------------------
        // Average Completion Time
        // -----------------------------------------
        const averageCompletionTime =
            summary.completedTasks === 0
                ? 0
                : Math.round(
                    summary.totalCompletionTime /
                    summary.completedTasks
                );

        // Convert milliseconds to days
        const averageCompletionTimeInDays =
            Number(
                (
                    averageCompletionTime /
                    (1000 * 60 * 60 * 24)
                ).toFixed(2)
            );

        // -----------------------------------------
        // Remove internal calculation field
        // -----------------------------------------
        delete summary.totalCompletionTime;

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    ...summary,
                    completionRate,
                    overdueRate,
                    averageCompletionTimeInDays
                },

                statusDistribution:
                    result.statusDistribution,

                priorityDistribution:
                    result.priorityDistribution,

                completionTrend:
                    result.completionTrend
            }
        });

    } catch(error){
        next(error);
    }
};

// Admin - Get task statistics across all users
export const getAdminTaskStats = async (req, res, next) => {
    try {
        const now = new Date();

        const stats = await Task.aggregate([
            {
                $facet: {
                    // Overall task statistics
                    summary: [
                        {
                            $group: {
                                _id: null,

                                totalTasks: {
                                    $sum: 1
                                },

                                todo: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$status", "todo"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                inProgress: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$status", "in-progress"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                completed: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$status", "completed"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                lowPriority: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$priority", "low"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                mediumPriority: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$priority", "medium"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                highPriority: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$priority", "high"] },
                                            1,
                                            0
                                        ]
                                    }
                                },

                                overdue: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $ne: ["$dueDate", null] },
                                                    { $lt: ["$dueDate", now] },
                                                    { $ne: ["$status", "completed"] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],

                    // Number of tasks created by each user
                    tasksByUser: [
                        {
                            $group: {
                                _id: "$user",
                                taskCount: {
                                    $sum: 1
                                }
                            }
                        },
                        {
                            $sort: {
                                taskCount: -1
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "_id",
                                foreignField: "_id",
                                as: "user"
                            }
                        },
                        {
                            $unwind: {
                                path: "$user",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                user: {
                                    _id: "$user._id",
                                    name: "$user.name",
                                    email: "$user.email"
                                },
                                taskCount: 1
                            }
                        }
                    ]
                }
            }
        ]);

        const result = stats[0];

        const summary = result.summary[0] || {
            totalTasks: 0,
            todo: 0,
            inProgress: 0,
            completed: 0,
            lowPriority: 0,
            mediumPriority: 0,
            highPriority: 0,
            overdue: 0
        };

        const completionRate = summary.totalTasks === 0
            ? 0
            : Number(
                ((summary.completed / summary.totalTasks) * 100).toFixed(2)
            );

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    ...summary,
                    completionRate
                },
                tasksByUser: result.tasksByUser
            }
        });

    } catch (error) {
        next(error);
    }
}