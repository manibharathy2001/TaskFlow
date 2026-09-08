export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check whether authenticated user has a role
        if(!req.user || !req.user.role){
            return res.status(403).json({
                success: false,
                message: "Access denied. User role is missing"
            });
        }

        // Check whether user's role is allowed
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions"
            });
        }

        // User has an allowed role
        next();
    }
}