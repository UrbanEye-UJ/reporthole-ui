"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateSpecialisations } from "@/app/api/generated/user-profile/user-profile";
import { getGetProfileQueryKey } from "@/app/api/generated/user-profile/user-profile";
import type { UpdateSpecialisationsRequestSpecialisationsItem } from "@/app/api/generated/openAPIDefinition.schemas";

/** Specialisation type — maps to the BE IssueType enum. */
export type IssueType = UpdateSpecialisationsRequestSpecialisationsItem;

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

/** Updates the authenticated contractor's specialisations. */
export const useUpdateSpecialisations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (specialisations: IssueType[]) =>
      updateSpecialisations({ specialisations }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    },
  });
};
