import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CivilianDashboard from "@/app/(civilian)/civilian/dashboard/page";
import AdminDashboard from "@/app/(admin)/admin/dashboard/page";
import ContractorDashboard from "@/app/(contractor)/contractor/dashboard/page";

const renderWithClient = (ui: React.ReactElement) =>
    render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/app/api/generated/incidents/incidents", () => ({
    useGetMyIncidents: () => ({ data: undefined, refetch: jest.fn() }),
    useCreateIncident: () => ({ mutate: jest.fn(), isPending: false }),
    useConfirmDuplicate: () => ({ mutate: jest.fn(), isPending: false }),
}));

// Stub EventSource
(global as unknown as { EventSource: unknown }).EventSource = jest.fn(() => ({
    addEventListener: jest.fn(),
    close: jest.fn(),
}));

describe("Dashboard pages", () => {
    it("renders the Civilian Dashboard", () => {
        renderWithClient(<CivilianDashboard />);
        expect(screen.getByText("Reporthole")).toBeInTheDocument();
    });

    it("renders the Admin Dashboard", () => {
        renderWithClient(<AdminDashboard />);
        expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    it("renders the Contractor Dashboard", () => {
        renderWithClient(<ContractorDashboard />);
        expect(screen.getByText("Contractor Dashboard")).toBeInTheDocument();
    });
});
