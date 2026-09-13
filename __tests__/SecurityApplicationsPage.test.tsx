import { render, screen, fireEvent } from "@testing-library/react";
import type { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import SecurityApplicationsPage from "@/app/(security)/security/applications/page";

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

const mockApprove = jest.fn();
const mockReject = jest.fn();
const mockInvalidateQueries = jest.fn();

const pending = {
    applicationId: "app-1",
    userId: "user-1",
    applicantFirstName: "Bob",
    applicantLastName: "Builder",
    applicantEmail: "bob@example.com",
    municipalityToken: "MUNI-ABC",
    municipalityName: "City of Joburg",
    submittedAt: "2026-01-01T10:00:00",
    status: "PENDING",
};
const approved = { ...pending, applicationId: "app-2", applicantFirstName: "Ada", status: "APPROVED" };

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock("@/app/api/generated/admin-applications/admin-applications", () => ({
    useListApplications: () => ({ data: { data: [pending, approved] }, isLoading: false }),
    useApprove: ({ mutation }: { mutation: { onSuccess?: () => void } }) => ({
        mutate: (p: unknown) => {
            mockApprove(p);
            mutation.onSuccess?.();
        },
    }),
    useReject: ({ mutation }: { mutation: { onSuccess?: () => void } }) => ({
        mutate: (p: unknown) => {
            mockReject(p);
            mutation.onSuccess?.();
        },
    }),
    getListApplicationsQueryKey: () => ["/admin/applications"],
}));

beforeEach(() => {
    mockApprove.mockReset();
    mockReject.mockReset();
    mockInvalidateQueries.mockReset();
});

describe("SecurityApplicationsPage", () => {
    it("renders records with applicant and municipality", () => {
        render(<SecurityApplicationsPage />);
        expect(screen.getByText("Bob Builder")).toBeInTheDocument();
        expect(screen.getByText("Ada Builder")).toBeInTheDocument();
        expect(screen.getAllByText("City of Joburg").length).toBeGreaterThan(0);
    });

    it("shows Approve/Reject only for PENDING rows", () => {
        render(<SecurityApplicationsPage />);
        // one pending row → exactly one Approve button
        expect(screen.getAllByText("Approve")).toHaveLength(1);
        expect(screen.getAllByText("Reject")).toHaveLength(1);
    });

    it("approves a pending application and refreshes", () => {
        render(<SecurityApplicationsPage />);
        fireEvent.click(screen.getByText("Approve"));
        expect(mockApprove).toHaveBeenCalledWith({ id: "app-1" });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["/admin/applications"] });
    });

    it("rejects a pending application and refreshes", () => {
        render(<SecurityApplicationsPage />);
        fireEvent.click(screen.getByText("Reject"));
        expect(mockReject).toHaveBeenCalledWith({ id: "app-1" });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["/admin/applications"] });
    });
});
