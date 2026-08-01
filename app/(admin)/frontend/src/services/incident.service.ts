import api from "./api";

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

class IncidentService {
  async getAll(): Promise<Incident[]> {
    const response = await api.get("/incidents");
    return response.data;
  }

  async getById(id: number): Promise<Incident> {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  }

  async create(
    incident: CreateIncidentRequest
  ): Promise<Incident> {
    const response = await api.post(
      "/incidents",
      incident
    );

    return response.data;
  }

  async update(
    id: number,
    incident: UpdateIncidentRequest
  ): Promise<Incident> {
    const response = await api.put(
      `/incidents/${id}`,
      incident
    );

    return response.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/incidents/${id}`);
  }

  async assignContractor(
    id: number,
    contractorId: number
  ): Promise<Incident> {
    const response = await api.patch(
      `/incidents/${id}/assign`,
      {
        contractorId,
      }
    );

    return response.data;
  }

  async updateStatus(
    id: number,
    status: Incident["status"]
  ): Promise<Incident> {
    const response = await api.patch(
      `/incidents/${id}/status`,
      {
        status,
      }
    );

    return response.data;
  }
}

export default new IncidentService();