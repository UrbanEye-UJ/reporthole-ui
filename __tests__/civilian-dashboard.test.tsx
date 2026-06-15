import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CivilianDashboard from "@/app/(civilian)/civilian/dashboard/page";

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
        isLoading: false,
    }),
    useCreateIncident: () => ({
        mutateAsync: jest.fn().mockResolvedValue({ data: { incidentId: "2", incidentType: "POTHOLE" } }),
    }),
}));

const setCookie = (value: string) => {
    Object.defineProperty(document, "cookie", {
        value,
        configurable: true,
        writable: true,
    });
};

const renderDashboard = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <CivilianDashboard />
        </QueryClientProvider>
    );
};

beforeEach(() => {
    mockPush.mockClear();
    setCookie("reporthole_token=test-token; reporthole_role=CIVILIAN");
});

describe("CivilianDashboard", () => {
    describe("rendering", () => {
        it("renders the app name", () => {
            renderDashboard();
            expect(screen.getByText("Reporthole")).toBeInTheDocument();
        });

        it("renders the Report Issue button", () => {
            renderDashboard();
            expect(screen.getByRole("button", { name: /report issue/i })).toBeInTheDocument();
        });

        it("renders status cards", () => {
            renderDashboard();
            expect(screen.getByText("Total")).toBeInTheDocument();
            expect(screen.getByText("In Progress")).toBeInTheDocument();
            expect(screen.getByText("Resolved")).toBeInTheDocument();
        });

        it("renders recent issues section", () => {
            renderDashboard();
            expect(screen.getByText("Recent Issues")).toBeInTheDocument();
        });

        it("renders the issue list", () => {
            renderDashboard();
            expect(screen.getByText("Pothole")).toBeInTheDocument();
        });
    });

    describe("logout", () => {
        it("redirects to /login on logout", () => {
            renderDashboard();
            fireEvent.click(screen.getByLabelText("Logout"));
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    describe("report modal", () => {
        it("opens the report modal when Report Issue is clicked", () => {
            renderDashboard();
            fireEvent.click(screen.getByRole("button", { name: /report issue/i }));
            expect(screen.getByText("Issue Type")).toBeInTheDocument();
        });

        it("closes the modal when Cancel is clicked", () => {
            renderDashboard();
            fireEvent.click(screen.getByRole("button", { name: /report issue/i }));
            fireEvent.click(screen.getByText("Cancel"));
            expect(screen.queryByText("Issue Type")).not.toBeInTheDocument();
        });
    });
});
