export type Status = "reported" | "assigned" | "in_progress" | "resolved";

/** A single entry in an incident's status history, e.g. a contractor's rejection reason. */
export interface WorkflowEntry {
    status?: string;
    notes?: string;
    updatedDate?: string;
    updatedBy?: string;
}

export interface Issue {
    id: string;
    userId?: string;
    title: string;
    description: string;
    location: string;
    locationAddress?: string;
    date: string;
    status: Status;
    image: string;
    reporterCount?: number;
    /** Status/progress history — includes rejection reasons and contractor notes, oldest first. */
    workflowHistory?: WorkflowEntry[];
}
