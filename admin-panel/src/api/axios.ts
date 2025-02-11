import axios from "axios";
declare const process: {
  env: {
    REACT_APP_API_URL: string;
  };
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
