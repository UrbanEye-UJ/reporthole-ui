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
