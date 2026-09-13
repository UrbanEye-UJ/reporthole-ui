import { render, screen } from "@testing-library/react";
import type { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import SecurityAuditPage from "@/app/(security)/security/audit/page";

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

const entries = [
    {
        auditId: "a1",
        action: "ROLE_GRANTED",
        actorName: "Sam Secure",
        targetName: "Terry Target",
        targetId: "11111111-1111-1111-1111-111111111111",
        fromValue: "CIVILIAN",
        toValue: "ADMIN",
        reason: "Q3 rollout",
        createdAt: "2026-01-01T09:00:00",
    },
];

jest.mock("@/app/api/generated/security-admin/security-admin", () => ({
    useListAudit: () => ({ data: { data: entries }, isLoading: false }),
}));

describe("SecurityAuditPage", () => {
    it("renders an audit entry with actor, target and change", () => {
        render(<SecurityAuditPage />);

        expect(screen.getByText("ROLE_GRANTED")).toBeInTheDocument();
        expect(screen.getByText("Sam Secure")).toBeInTheDocument();
        expect(screen.getByText("Terry Target")).toBeInTheDocument();
        expect(screen.getByText("CIVILIAN → ADMIN")).toBeInTheDocument();
        expect(screen.getByText("Q3 rollout")).toBeInTheDocument();
    });

    it("links each row to Manage Account for the target", () => {
        render(<SecurityAuditPage />);

        const manage = screen.getByRole("link", { name: "Manage" });
        expect(manage).toHaveAttribute(
            "href",
            "/security/account?userId=11111111-1111-1111-1111-111111111111"
        );
    });
});
