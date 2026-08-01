import api from "./api";

export interface Contractor {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  municipality: string;
  status: "Available" | "Busy" | "Offline";
  activeJobs: number;
  completedJobs: number;
  rating: number;
}

export interface CreateContractorRequest {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  municipality: string;
}

export interface UpdateContractorRequest {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  municipality?: string;
  status?: "Available" | "Busy" | "Offline";
}

export interface ContractorPerformance {
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  averageCompletionTime: number;
  rating: number;
}

class ContractorService {
  async getAll(): Promise<Contractor[]> {
    const response = await api.get("/contractors");
    return response.data;
  }

  async getById(id: number): Promise<Contractor> {
    const response = await api.get(`/contractors/${id}`);
    return response.data;
  }

  async create(
    contractor: CreateContractorRequest
  ): Promise<Contractor> {
    const response = await api.post(
      "/contractors",
      contractor
    );

    return response.data;
  }

  async update(
    id: number,
    contractor: UpdateContractorRequest
  ): Promise<Contractor> {
    const response = await api.put(
      `/contractors/${id}`,
      contractor
    );

    return response.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/contractors/${id}`);
  }

  async getPerformance(
    id: number
  ): Promise<ContractorPerformance> {
    const response = await api.get(
      `/contractors/${id}/performance`
    );

    return response.data;
  }

  async getAssignedIncidents(id: number) {
    const response = await api.get(
      `/contractors/${id}/incidents`
    );

    return response.data;
  }

  async setAvailability(
    id: number,
    status: Contractor["status"]
  ): Promise<Contractor> {
    const response = await api.patch(
      `/contractors/${id}/availability`,
      {
        status,
      }
    );

    return response.data;
  }
}

export default new ContractorService();