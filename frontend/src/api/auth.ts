import type { Task } from "../types/task.types";
import api from "./axiosInstance";

export const getData = async (endpoint: string) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    throw error;
  }
};

export const postData = async (endpoint: string, data: Task) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("Failed to post data:", error);
    throw error;
  }
};
