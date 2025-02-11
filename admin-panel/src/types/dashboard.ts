export interface DashboardStats {
  totalResponders: number;
  activeResponders: number;
  totalQuestions: number;
  pendingQuestions: number;
  answeredQuestions: number;
  responseRate: number;
}

export interface RecentActivity {
  id: string;
  responderId: string;
  responderName: string;
  action: "answer" | "login" | "status_change";
  questionId?: string;
  timestamp: string;
  details: string;
}
