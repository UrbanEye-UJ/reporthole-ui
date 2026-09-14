import { render, screen, fireEvent } from "@testing-library/react";
import IncidentDetailModal from "@/components/shared/IncidentDetailModal";
import { Issue } from "@/app/types/issue";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const issue: Issue = {
    id: "abc-123",
    title: "Pothole",
    description: "Large pothole on Main Road",
    location: "-26.2041, 28.0473",
    date: "16 Jun",
    status: "reported",
    image: "/api/image-proxy?url=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fuploads%2Ftest.jpg",
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

describe("IncidentDetailModal", () => {
    it("renders nothing when issue is null", () => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={null} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(container.firstChild).toBeNull();
    });

    it("renders the issue title", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <IncidentDetailModal issue={issue} onClose={jest.fn()} />
            </QueryClientProvider>
                );
        expect(screen.getByText("Pothole")).toBeInTheDocument();
    });

    it("renders the description", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={issue} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByText("Large pothole on Main Road")).toBeInTheDocument();
    });

    it("renders the location", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={issue} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByText("-26.2041, 28.0473")).toBeInTheDocument();
    });

    it("renders the date", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={issue} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByText("16 Jun")).toBeInTheDocument();
    });

    it("renders the status badge", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={issue} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByText("Reported")).toBeInTheDocument();
    });

    it("renders the image", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={issue} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByAltText("Pothole")).toBeInTheDocument();
    });

    it("calls onClose when the Close button is clicked", () => {
        const onClose = jest.fn();
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={issue} onClose={onClose} />
            </QueryClientProvider>
        );
        fireEvent.click(screen.getByText("Close"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the backdrop is clicked", () => {
        const onClose = jest.fn();
        const { container } = render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={issue} onClose={onClose} />
            </QueryClientProvider>
        );
        // The backdrop is the outermost div
        fireEvent.click(container.firstChild as Element);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when the modal card itself is clicked", () => {
        const onClose = jest.fn();
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={issue} onClose={onClose} />
            </QueryClientProvider>
        );
        fireEvent.click(screen.getByText("Pothole"));
        expect(onClose).not.toHaveBeenCalled();
    });

    it("renders In Progress status badge correctly", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={{ ...issue, status: "in_progress" }} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("renders Resolved status badge correctly", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={{ ...issue, status: "resolved" }} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByText("Resolved")).toBeInTheDocument();
    });

    it("shows singular reporter count when 1 person reported", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={{ ...issue, reporterCount: 1 }} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByText("1 person reported this")).toBeInTheDocument();
    });

    it("shows plural reporter count when multiple people reported", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={{ ...issue, reporterCount: 4 }} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByText("4 people reported this")).toBeInTheDocument();
    });

    it("defaults to 1 person reported when reporterCount is undefined", () => {
        const { reporterCount: _, ...issueWithoutCount } = { ...issue, reporterCount: undefined };
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={issueWithoutCount} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.getByText("1 person reported this")).toBeInTheDocument();
    });

    it("shows the still-unresolved button when status is resolved and a handler is provided", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal
                issue={{ ...issue, status: "resolved" }}
                onClose={jest.fn()}
                onStillUnresolved={jest.fn()}
            />
            </QueryClientProvider>
        );
        expect(screen.getByText("Still broken? Report it")).toBeInTheDocument();
    });

    it("does not show the still-unresolved button when status is not resolved", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal
                issue={{ ...issue, status: "reported" }}
                onClose={jest.fn()}
                onStillUnresolved={jest.fn()}
            />
            </QueryClientProvider>
        );
        expect(screen.queryByText("Still broken? Report it")).not.toBeInTheDocument();
    });

    it("does not show the still-unresolved button when no handler is provided", () => {
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal issue={{ ...issue, status: "resolved" }} onClose={jest.fn()} />
            </QueryClientProvider>
        );

        expect(screen.queryByText("Still broken? Report it")).not.toBeInTheDocument();
    });

    it("calls onStillUnresolved with the issue id when clicked", () => {
        const onStillUnresolved = jest.fn();
        render(
            <QueryClientProvider client={queryClient}>
            <IncidentDetailModal
                issue={{ ...issue, status: "resolved" }}
                onClose={jest.fn()}
                onStillUnresolved={onStillUnresolved}
            />
            </QueryClientProvider>
        );
        fireEvent.click(screen.getByText("Still broken? Report it"));
        expect(onStillUnresolved).toHaveBeenCalledWith("abc-123");
    });

    it("does not show the status updates section when there is no workflow history", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <IncidentDetailModal issue={issue} onClose={jest.fn()} />
            </QueryClientProvider>
        );
        expect(screen.queryByText("Status updates")).not.toBeInTheDocument();
    });

    it("shows a contractor's rejection reason in the status updates section", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <IncidentDetailModal
                    issue={{
                        ...issue,
                        workflowHistory: [
                            {
                                status: "VERIFIED",
                                notes: "Rejected by Con Tractor — needs reassignment. Reason: Wrong address",
                                updatedBy: "Con Tractor",
                                updatedDate: "2026-06-16T10:00:00",
                            },
                        ],
                    }}
                    onClose={jest.fn()}
                />
            </QueryClientProvider>
        );
        expect(screen.getByText("Status updates")).toBeInTheDocument();
        expect(
            screen.getByText("Rejected by Con Tractor — needs reassignment. Reason: Wrong address")
        ).toBeInTheDocument();
    });
});
