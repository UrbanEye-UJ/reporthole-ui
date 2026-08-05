"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/axios";

export interface ContractorResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  activeJobs: number;
  completedJobs: number;
  createdAt: string;
}

export interface CreateContractorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface AppResponseListContractor {
  data?: ContractorResponse[];
  message?: string;
  status?: number;
  timestamp?: string;
}

interface AppResponseContractor {
  data?: ContractorResponse;
  message?: string;
  status?: number;
  timestamp?: string;
}

export const CONTRACTORS_QUERY_KEY = ["/admin/contractors"] as const;

// Hand-written to match the orval-generated hook shape (see app/api/generated/incidents/incidents.ts).
// GET/POST /admin/contractors aren't in the OpenAPI spec's generated client yet — once
// `npm run generate:api` is rerun against the updated backend, these can be replaced with
// generated hooks.
export const getContractors = (signal?: AbortSignal) =>
  apiClient<AppResponseListContractor>({ url: "/admin/contractors", method: "GET", signal });

export const useGetContractors = () =>
  useQuery({
    queryKey: CONTRACTORS_QUERY_KEY,
    queryFn: ({ signal }) => getContractors(signal),
  });

export const createContractor = (data: CreateContractorRequest) =>
  apiClient<AppResponseContractor>({
    url: "/admin/contractors",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data,
  });

export const useCreateContractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContractor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTORS_QUERY_KEY });
    },
  });
};
