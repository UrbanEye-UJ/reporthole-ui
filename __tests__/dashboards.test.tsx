import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CivilianDashboard from "@/app/(civilian)/civilian/dashboard/page";
import AdminDashboard from "@/app/(admin)/admin/dashboard/page";
import ContractorDashboard from "@/app/(contractor)/contractor/dashboard/page";

// @mui/x-data-grid ships ESM-only internals that fail to load in jsdom.
// Mock the sub-components that pull it in so AdminDashboard can render.
jest.mock("@/app/(admin)/_components/dashboard/RecentIncidents", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("@/app/(admin)/_components/dashboard/IncidentMap", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("@/app/(admin)/_components/dashboard/RepairProgress", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("@/app/(admin)/_components/dashboard/SeverityChart", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("@/app/(admin)/_components/dashboard/AISummary", () => ({
    __esModule: true,
    default: () => null,
}));

const renderWithClient = (ui: React.ReactElement) =>
    render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
    usePathname: () => "/admin/dashboard",
}));

jest.mock("@/app/api/generated/incidents/incidents", () => ({
    useGetMyIncidents: () => ({ data: undefined, refetch: jest.fn() }),
    useSearchMyIncidents: () => ({ data: undefined }),
    useDeleteIncident: () => ({ mutate: jest.fn() }),
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
        expect(screen.getByText("Operations Center")).toBeInTheDocument();
    });

    it("renders the Contractor Dashboard", () => {
        renderWithClient(<ContractorDashboard />);
        expect(screen.getByText("Contractor Dashboard")).toBeInTheDocument();
    });
});
