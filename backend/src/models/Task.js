import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
            minlength: [2, "Task title must be at least 2 characters long"],
            maxlength: [100, "Task title cannot exceed 100 characters"]
        },

        description: {
            type: String,
            trim: true,
            maxlength: [500, "Task description cannot exceed 500 characters"],
        },

        status: {
            type: String,
            enum: ["todo", "in-progress", "completed"],
            default: "todo"
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        dueDate: {
            type: Date
        },

        completedAt: {
            type: Date,
            default: null
        },

        // User relationship with Task
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Task must belong to a user"]
        },
    },
    {
        timestamps: true
    }
);

// Indexes for common task queries
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1, createdAt: -1 });
taskSchema.index({ user: 1, priority: 1, createdAt: -1 });
taskSchema.index({ user: 1, dueDate: 1 });

// Create the Task model
const Task = mongoose.model("Task", taskSchema);

export default Task;