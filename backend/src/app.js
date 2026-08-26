import express from "express";
import healthRoutes from "./routes/healthRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import notFound from "./middleware/notFoundMiddleware.js";
import errorHandler from "./middleware/errorMiddleware.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api", healthRoutes);

app.use("/api/users", userRoutes);

app.use("/api/tasks", taskRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;