import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CivilianDashboard from "@/app/(civilian)/civilian/dashboard/page";

// Stub EventSource so the SSE useEffect doesn't crash in jsdom
const mockEventSource = {
    addEventListener: jest.fn(),
    onerror: null as null | (() => void),
    close: jest.fn(),
};
(global as unknown as { EventSource: unknown }).EventSource = jest.fn(() => mockEventSource);

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/app/api/generated/incidents/incidents", () => ({
    useGetMyIncidents: () => ({
        data: {
            data: [
                {
                    incidentId: "1",
                    incidentType: "POTHOLE",
                    description: "Big pothole on main road",
                    latitude: -26.2041,
                    longitude: 28.0473,
                    incidentDate: "2024-01-15T10:00:00Z",
                    imageUrl: "",
                },
            ],
        },
        refetch: jest.fn(),
    }),
    useCreateIncident: () => ({ mutate: jest.fn(), isPending: false }),
    useConfirmDuplicate: () => ({ mutate: jest.fn(), isPending: false }),
}));

const setCookie = (value: string) => {
    Object.defineProperty(document, "cookie", {
        value,
        configurable: true,
        writable: true,
    });
};

const renderWithClient = (ui: React.ReactElement) =>
    render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

beforeEach(() => {
    mockPush.mockClear();
    setCookie("reporthole_token=test-token; reporthole_role=CIVILIAN");
});

describe("CivilianDashboard", () => {
    describe("rendering", () => {
        it("renders the app name", () => {
            renderWithClient(<CivilianDashboard />);
            expect(screen.getByText("Reporthole")).toBeInTheDocument();
        });

        it("renders the Report Issue button", () => {
            renderWithClient(<CivilianDashboard />);
            expect(screen.getByRole("button", { name: /report issue/i })).toBeInTheDocument();
        });

        it("renders status cards", () => {
            renderWithClient(<CivilianDashboard />);
            expect(screen.getByText("Total")).toBeInTheDocument();
            expect(screen.getByText("In Progress")).toBeInTheDocument();
            expect(screen.getByText("Resolved")).toBeInTheDocument();
        });

        it("renders recent issues section", () => {
            renderWithClient(<CivilianDashboard />);
            expect(screen.getByText("Recent Issues")).toBeInTheDocument();
        });

        it("renders the issue list", () => {
            renderWithClient(<CivilianDashboard />);
            expect(screen.getByText("POTHOLE")).toBeInTheDocument();
        });
    });

    describe("logout", () => {
        it("redirects to /login on logout", () => {
            renderWithClient(<CivilianDashboard />);
            fireEvent.click(screen.getByLabelText("Logout"));
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    describe("report modal", () => {
        it("opens the report modal when Report Issue is clicked", () => {
            renderWithClient(<CivilianDashboard />);
            fireEvent.click(screen.getByRole("button", { name: /report issue/i }));
            expect(screen.getByText("Issue Type")).toBeInTheDocument();
        });

        it("closes the modal when Cancel is clicked", () => {
            renderWithClient(<CivilianDashboard />);
            fireEvent.click(screen.getByRole("button", { name: /report issue/i }));
            fireEvent.click(screen.getByText("Cancel"));
            expect(screen.queryByText("Issue Type")).not.toBeInTheDocument();
        });
    });
});
