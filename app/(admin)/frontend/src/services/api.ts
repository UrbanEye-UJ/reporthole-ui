import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,

  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Authentication token will be added here later
    // const token = localStorage.getItem("token");
    //
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized");
    }

    if (error.response?.status === 500) {
      console.log("Server Error");
    }

    return Promise.reject(error);
  }
);

export default api;