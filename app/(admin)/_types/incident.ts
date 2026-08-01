export interface Incident {
  id: number;
  title: string;
  description: string;
  road: string;
  municipality: string;
  latitude: number;
  longitude: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Assigned" | "In Progress" | "Resolved";
  reportedBy: string;
  contractor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  road: string;
  municipality: string;
  latitude: number;
  longitude: number;
  severity: "Low" | "Medium" | "High" | "Critical";
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  road?: string;
  municipality?: string;
  latitude?: number;
  longitude?: number;
  severity?: "Low" | "Medium" | "High" | "Critical";
  status?: "Open" | "Assigned" | "In Progress" | "Resolved";
  contractor?: string;
}
