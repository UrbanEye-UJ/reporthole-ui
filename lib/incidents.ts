import { apiClient } from "@/lib/axios";

export type IncidentSource = "CIVILIAN";
export type IssueType =
    | "POTHOLE"
    | "CRACK"
    | "FADED_MARKINGS"
    | "DAMAGED_SIGN"
    | "BLOCKED_DRAIN"
    | "BROKEN_TRAFFIC_LIGHT";

export interface IncidentRequestDTO {
    incidentType: IssueType;
    description: string;
    source: IncidentSource;
    latitude: number;
    longitude: number;
    imageBase64: string;
    userId: string;
}

export interface AppResponse {
    data?: IncidentRequestDTO;
    message?: string;
    status?: number;
    timestamp?: string;
}

export const createIncident = (
    incidentRequest: IncidentRequestDTO,
    signal?: AbortSignal
) => {
    return apiClient<AppResponse>({
        url: "/incidents/create",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: incidentRequest,
        signal,
    });
};