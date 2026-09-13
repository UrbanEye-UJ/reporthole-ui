"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

export type IssueType =
    | "POTHOLE"
    | "CRACK"
    | "FADED_MARKINGS"
    | "DAMAGED_SIGN"
    | "BLOCKED_DRAIN"
    | "BROKEN_TRAFFIC_LIGHT"
    | "ACCIDENT"
    | "OTHER";

/** All issue types in display order, including the OTHER catch-all. */
export const ALL_ISSUE_TYPES: IssueType[] = [
    "POTHOLE",
    "CRACK",
    "FADED_MARKINGS",
    "DAMAGED_SIGN",
    "BLOCKED_DRAIN",
    "BROKEN_TRAFFIC_LIGHT",
    "ACCIDENT",
    "OTHER",
];

/** Human-readable label for each issue type. */
export const ISSUE_TYPE_LABEL: Record<IssueType, string> = {
    POTHOLE: "Pothole",
    CRACK: "Cracked Surface",
    FADED_MARKINGS: "Faded Markings",
    DAMAGED_SIGN: "Damaged Sign",
    BLOCKED_DRAIN: "Blocked Drain",
    BROKEN_TRAFFIC_LIGHT: "Broken Traffic Light",
    ACCIDENT: "Accident",
    OTHER: "Other / All Types",
};

// Hand-written to match the orval-generated hook shape — PATCH /users/profile/specialisations.
export const useUpdateSpecialisations = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (specialisations: IssueType[]) =>
            apiClient<void>({
                url: "/users/profile/specialisations",
                method: "PATCH",
                data: { specialisations },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        },
    });
};
