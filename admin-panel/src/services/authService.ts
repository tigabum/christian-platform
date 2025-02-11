import api from "../api/axios";

interface LoginResponse {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post<LoginResponse>("/auth/admin/login", {
      email,
      password,
    });

    if (response.data.token) {
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminUser", JSON.stringify(response.data.admin));
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  },

  getCurrentAdmin: () => {
    const admin = localStorage.getItem("adminUser");
    return admin ? JSON.parse(admin) : null;
  },
};
