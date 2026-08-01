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
