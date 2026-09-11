import api from "./api";

// Get all tasks for the logged-in user
export const getTasks = async (params = {}) => {
  const response = await api.get("/tasks", {
    params,
  });

  return response.data;
};

// Get one task by ID
export const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);

  return response.data;
};

// Create a new task
export const createTask = async (taskData) => {
  const response = await api.post("/tasks", taskData);

  return response.data;
};

// Update an existing task
export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(
    `/tasks/${taskId}`,
    taskData
  );

  return response.data;
};

// Delete a task
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);

  return response.data;
};

// Get task statistics for the logged-in user
export const getTaskStats = async () => {
  const response = await api.get("/tasks/stats");

  return response.data;
};

// Get advanced task analytics
export const getTaskAnalytics = async () => {
  const response = await api.get("/tasks/analytics");

  return response.data;
};