import Task from "../models/Task.js";

// Create task
export const createTask = async (req, res, next) => {
    try{
        const {
            title,
            description,
            status,
            priority,
            dueDate,
            userId
        } = req.body;

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            user: userId,
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

// Get all tasks
export const getTasks = async (req, res, next) => {
    try{
        const { userId } = req.query;

        // get filter by user
        const filter = userId ? { user: userId } : {};

        const tasks = await Task.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
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

        const task = await Task.findById(id)
            .populate("user", "name email");

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

        const task = await Task.findByIdAndUpdate(
            id,
            {
                title,
                description,
                status,
                priority,
                dueDate
            },
            {
                returnDocument: "after", // return the updated
                runValidators: true
            }
        );

        // populate user but only name & email
        await task.populate("user", "name email");

        if(!task){
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

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

        const task = await Task.findByIdAndDelete(id);

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