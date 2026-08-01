import api from "./api";

export interface DashboardStats {
  totalIncidents: number;
  activeRepairs: number;
  resolvedToday: number;
  averageResponseTime: string;
}

export interface RecentIncident {
  id: number;
  road: string;
  municipality: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Assigned" | "In Progress" | "Resolved";
  reportedAt: string;
}

export interface RepairProgress {
  contractor: string;
  completed: number;
}

export interface SeverityDistribution {
  severity: string;
  value: number;
}

export interface AISummary {
  summary: string;
  priority: string;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get("/dashboard/stats");
    return response.data;
  }

  async getRecentIncidents(): Promise<RecentIncident[]> {
    const response = await api.get("/dashboard/incidents");
    return response.data;
  }

  async getRepairProgress(): Promise<RepairProgress[]> {
    const response = await api.get("/dashboard/repairs");
    return response.data;
  }

  async getSeverityDistribution(): Promise<SeverityDistribution[]> {
    const response = await api.get("/dashboard/severity");
    return response.data;
  }

  async getAISummary(): Promise<AISummary> {
    const response = await api.get("/dashboard/ai-summary");
    return response.data;
  }
}

export default new DashboardService();