import User from "../models/User.js";

export const registerUser = async (req, res, next) => {
    try{
        // get data from the request
        const {name, email, password} = req.body;

        // Create the User
        const user = await User.create({
            name,
            email,
            password,
        });

        // Send the response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user,
            },
        });
    } catch(error){
        next(error);
    }
};  