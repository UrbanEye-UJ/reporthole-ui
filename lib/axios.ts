import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api",
});

axiosInstance.interceptors.request.use((config) => {
    return config;
});

export const apiClient = <T>(config: Parameters<typeof axiosInstance>[0]): Promise<T> => {
    return axiosInstance(config).then((response) => response.data);
};

