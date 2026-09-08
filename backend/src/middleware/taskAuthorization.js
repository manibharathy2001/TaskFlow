import mongoose from "mongoose";
import Task from "../models/Task.js";

export const authorizeTask = async (req, res, next) => {
    try{
        const { id } = req.params;

        // Check whether task ID is a valid MongoDB ObjectID
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success: false,
                message: "Invalid task ID"
            });
        }

        // Find task 
        const task = await Task.findById(id);

        // Task doesn't exist
        if(!task){
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Check task ownership
        if(task.user.toString() !== req.user.userId.toString()){
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Attach task to request
        req.task = task;

        // Continue
        next();

    } catch(error){
        next(error);
    }
};