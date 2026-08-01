import api from "./api";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "Admin" | "Contractor" | "Citizen";
  avatar?: string;
}

class AuthService {
  async getCurrentUser(): Promise<User> {
    const response = await api.get("/auth/me");
    return response.data;
  }

  async refreshSession(): Promise<void> {
    await api.post("/auth/refresh");
  }

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  }
}

export default new AuthService();