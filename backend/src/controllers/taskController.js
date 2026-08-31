import Task from "../models/Task.js";

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

// Get all tasks
export const getTasks = async (req, res, next) => {
    try{
        // filter tasks by user
        const filter = {
            user: req.user.userId
        };

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

        // MongoDB checks both task_ID and logged-in user
        const task = await Task.findById({
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

        const task = await Task.findByIdAndUpdate(
            {
                _id: id,
                user: req.user.userId
            },
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

        const task = await Task.findByIdAndDelete({
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