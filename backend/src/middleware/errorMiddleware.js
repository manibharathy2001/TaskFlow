const errorHandler = (err, req, res, next) => {
    console.error(err);

    //Mongoose validation error
    if(err.name === "ValiadtionError"){
        const errors = Object.values(err.errors).map((error) => ({
            field: error.path,
            message: error.message
        }));

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
    }

    // Invalid MongoDB ObjectId
    if(err.name === "CastError"){
        return res.status(400).json({
            success: false,
            message: "Invalid resource ID"
        });
    }

    // Duplicate MongoDB value
    if(err.code === 11000){
        const field = Object.keys(err.keyValue)[0];

        return res.status(409).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // Default error
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

export default errorHandler;
