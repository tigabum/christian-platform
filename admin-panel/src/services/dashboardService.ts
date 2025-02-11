import api from "../api/axios";

export interface DashboardStats {
  totalResponders: number;
  activeResponders: number;
  totalQuestions: number;
  answeredQuestions: number;
  pendingQuestions: number;
  responseRate: number;
}

export interface Activity {
  id: string;
  type: "answer" | "login" | "status_change";
  title: string;
  asker: string;
  responderId?: string;
  responder?: string;
  timestamp: string;
  status: string;
}

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get<DashboardStats>("/admin/dashboard/stats");
    return response.data;
  },

  // Get recent activities
  getActivities: async () => {
    const response = await api.get<Activity[]>("/admin/dashboard/activities");
    return response.data;
  },
};
