import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CivilianDashboard from "@/app/(civilian)/civilian/dashboard/page";
import AdminDashboard from "@/app/(admin)/admin/dashboard/page";
import ContractorDashboard from "@/app/(contractor)/contractor/dashboard/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/app/api/generated/incidents/incidents", () => ({
    useGetMyIncidents: () => ({ data: undefined, isLoading: false }),
    useCreateIncident: () => ({ mutateAsync: jest.fn() }),
}));

const renderWithQuery = (ui: React.ReactElement) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("Dashboard pages", () => {
    it("renders the Civilian Dashboard", () => {
        renderWithQuery(<CivilianDashboard />);
        expect(screen.getByText("Reporthole")).toBeInTheDocument();
    });

    it("renders the Admin Dashboard", () => {
        renderWithQuery(<AdminDashboard />);
        expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    it("renders the Contractor Dashboard", () => {
        renderWithQuery(<ContractorDashboard />);
        expect(screen.getByText("Contractor Dashboard")).toBeInTheDocument();
    });
});
