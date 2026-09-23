import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import SecurityIncidentsPage from "@/app/(security)/security/incidents/page";

jest.mock("@/app/api/generated/municipalities/municipalities", () => ({
    useList: jest.fn(),
}));

jest.mock("@/app/api/generated/incidents/incidents", () => ({
    useSearchIncidents: jest.fn(),
}));

jest.mock("@/app/(security)/_components/incidents/AnnotationOverlay", () => ({
    __esModule: true,
    // Own hooks (react-query) and behaviour are covered by AnnotationOverlay.test.tsx;
    // stubbed here so this page test doesn't need a QueryClientProvider.
    default: () => null,
}));

jest.mock("@/app/(security)/_components/DataTable", () => ({
    __esModule: true,
    default: ({ rows, columns }: { rows: GridRowsProp; columns: GridColDef[] }) => (
        <table>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.id as string}>
                        {columns.map((col) => (
                            <td key={col.field}>
                                {col.renderCell
                                    ? col.renderCell({ row, value: row[col.field] } as never)
                                    : String(row[col.field] ?? "")}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    ),
}));

const mockMapProps = jest.fn();

jest.mock("@/app/(security)/_components/SecurityIncidentMap", () => ({
    __esModule: true,
    default: (props: { view: string; municipalityId?: string; boundary?: unknown; issueType?: string }) => {
        mockMapProps(props);
        return <div data-testid="security-map">map: {props.view} / {props.municipalityId ?? "all"}</div>;
    },
}));

import { useList } from "@/app/api/generated/municipalities/municipalities";
import { useSearchIncidents } from "@/app/api/generated/incidents/incidents";

const mockUseList = useList as jest.Mock;
const mockUseSearchIncidents = useSearchIncidents as jest.Mock;

const tshwaneBoundary = { type: "MultiPolygon", coordinates: [[[[28.0, -25.7], [28.2, -25.7], [28.2, -25.9], [28.0, -25.7]]]] };

const municipalities = [
    { id: "m-1", name: "City of Tshwane", province: "Gauteng", tokenCount: 1, boundary: tshwaneBoundary },
    { id: "m-2", name: "City of Johannesburg", province: "Gauteng", tokenCount: 2, boundary: null },
];

const incidentPage = {
    content: [
        {
            incidentId: "i-1",
            incidentType: "POTHOLE",
            locationAddress: "Main Road, Tshwane",
            status: "REPORTED",
            reporterCount: 3,
            incidentDate: "2026-01-05T10:00:00",
        },
    ],
    totalElements: 1,
    page: 0,
    size: 50,
};

describe("SecurityIncidentsPage", () => {
    beforeEach(() => {
        mockMapProps.mockClear();
        mockUseList.mockReturnValue({ data: { data: municipalities }, isLoading: false });
        mockUseSearchIncidents.mockReturnValue({ data: { data: incidentPage }, isLoading: false });
    });

    it("renders the page title as Incidents", async () => {
        render(<SecurityIncidentsPage />);
        expect(screen.getByRole("heading", { name: "Incidents" })).toBeInTheDocument();
        await screen.findByTestId("security-map");
    });

    it("defaults to all municipalities, all types, and the pins view", async () => {
        render(<SecurityIncidentsPage />);
        await screen.findByTestId("security-map");
        expect(mockMapProps).toHaveBeenLastCalledWith({
            view: "pins",
            municipalityId: undefined,
            boundary: undefined,
            issueType: undefined,
        });
    });

    it("renders the incident table row from the search results", () => {
        render(<SecurityIncidentsPage />);
        expect(screen.getByText("Main Road, Tshwane")).toBeInTheDocument();
        expect(screen.getByText("Incidents (1)")).toBeInTheDocument();
    });

    it("filters both the map and the search query by municipality", async () => {
        render(<SecurityIncidentsPage />);
        fireEvent.mouseDown(screen.getByLabelText("Municipality"));
        fireEvent.click(await screen.findByRole("option", { name: "City of Tshwane" }));

        await waitFor(() =>
            expect(mockMapProps).toHaveBeenLastCalledWith({
                view: "pins",
                municipalityId: "m-1",
                boundary: tshwaneBoundary,
                issueType: undefined,
            })
        );
        expect(mockUseSearchIncidents).toHaveBeenLastCalledWith(
            expect.objectContaining({ municipalityId: "m-1" })
        );
    });

    it("filters both the map and the search query by issue type", async () => {
        render(<SecurityIncidentsPage />);
        fireEvent.mouseDown(screen.getByLabelText("Issue type"));
        fireEvent.click(await screen.findByRole("option", { name: "Pothole" }));

        await waitFor(() =>
            expect(mockMapProps).toHaveBeenLastCalledWith(
                expect.objectContaining({ issueType: "POTHOLE" })
            )
        );
        expect(mockUseSearchIncidents).toHaveBeenLastCalledWith(
            expect.objectContaining({ type: "POTHOLE" })
        );
    });

    it("switches to the K-Clusters view", async () => {
        render(<SecurityIncidentsPage />);
        await screen.findByTestId("security-map");
        fireEvent.click(screen.getByRole("button", { name: /k-clusters/i }));
        expect(mockMapProps).toHaveBeenLastCalledWith(
            expect.objectContaining({ view: "clusters" })
        );
    });

    it("requests at most 50 rows per page", () => {
        render(<SecurityIncidentsPage />);
        expect(mockUseSearchIncidents).toHaveBeenLastCalledWith(
            expect.objectContaining({ page: 0, size: 50 })
        );
    });
});
