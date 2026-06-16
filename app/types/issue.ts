export type Status = "reported" | "assigned" | "in_progress" | "resolved";

export interface Issue {
    id: string;
    title: string;
    description: string;
    location: string;
    locationAddress?: string;
    date: string;
    status: Status;
    image: string;
    reporterCount?: number;
}
