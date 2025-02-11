import axios from "axios";
declare const process: {
  env: {
    REACT_APP_API_URL: string;
  };
};

const api = axios.create({
  baseURL: "http://localhost:5080/api", // Hardcode for now
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Sending request with token:", token); // Debug log
  } else {
    console.log("No token found in localStorage"); // Debug log
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API Error:", error.response?.data); // Debug log
    return Promise.reject(error);
  }
);

export default api;
