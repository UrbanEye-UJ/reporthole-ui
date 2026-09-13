import { render, screen, fireEvent } from "@testing-library/react";
import type { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import SecurityMunicipalitiesPage from "@/app/(security)/security/municipalities/page";

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

const mockCreate = jest.fn();
const mockIssue = jest.fn();
const mockRevoke = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

const municipality = { id: "m-1", name: "City of Tshwane", province: "Gauteng", tokenCount: 2 };
const token = {
    id: "t-1",
    token: "MUNI-ABCDEFGHJKLM",
    municipalityName: "City of Tshwane",
    issuedByName: "Sam Secure",
    issuedAt: "2026-01-01T09:00:00",
    expiresAt: null,
    revokedAt: null,
    status: "ACTIVE",
};

jest.mock("@/app/api/generated/municipalities/municipalities", () => ({
    useList: () => ({ data: { data: [municipality] }, isLoading: false }),
    useListTokens: () => ({ data: { data: [token] }, isLoading: false }),
    getListQueryKey: () => ["/admin/municipalities"],
    getListTokensQueryKey: () => ["/admin/municipalities/tokens"],
    useCreate: ({ mutation }: { mutation: { onSuccess?: () => void } }) => ({
        mutate: (p: unknown) => {
            mockCreate(p);
            mutation.onSuccess?.();
        },
        isPending: false,
    }),
    useIssueToken: ({ mutation }: { mutation: { onSuccess?: (res: unknown) => void } }) => ({
        mutate: (p: unknown) => {
            mockIssue(p);
            // The component reads res.data?.token from the success response
            mutation.onSuccess?.({ data: { token: "MUNI-MOCK-TOKEN" } });
        },
        isPending: false,
    }),
    useRevokeToken: ({ mutation }: { mutation: { onSuccess?: () => void } }) => ({
        mutate: (p: unknown) => {
            mockRevoke(p);
            mutation.onSuccess?.();
        },
        isPending: false,
    }),
}));

beforeEach(() => {
    mockCreate.mockReset();
    mockIssue.mockReset();
    mockRevoke.mockReset();
});

describe("SecurityMunicipalitiesPage", () => {
    it("lists municipalities and their tokens", () => {
        render(<SecurityMunicipalitiesPage />);
        expect(screen.getAllByText("City of Tshwane").length).toBeGreaterThan(0);
        expect(screen.getByText("MUNI-ABCDEFGHJKLM")).toBeInTheDocument();
        expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    });

    it("creates a municipality", async () => {
        render(<SecurityMunicipalitiesPage />);
        fireEvent.click(screen.getByRole("button", { name: /Add municipality/i }));
        const nameField = await screen.findByRole("textbox", { name: /name/i });
        fireEvent.change(nameField, { target: { value: "City of Ekurhuleni" } });
        fireEvent.click(screen.getByRole("button", { name: /^Create$/i }));
        expect(mockCreate).toHaveBeenCalledWith({
            data: { name: "City of Ekurhuleni", province: "Gauteng" },
        });
    });

    it("issues a token for a municipality", async () => {
        render(<SecurityMunicipalitiesPage />);
        fireEvent.click(screen.getByRole("button", { name: /Issue token/i }));
        fireEvent.click(await screen.findByRole("button", { name: /^Issue$/i }));
        expect(mockIssue).toHaveBeenCalledWith({
            id: "m-1",
            data: { expiresInDays: undefined, note: undefined },
        });
    });

    it("revokes an active token", () => {
        render(<SecurityMunicipalitiesPage />);
        fireEvent.click(screen.getByRole("button", { name: /^Revoke$/i }));
        expect(mockRevoke).toHaveBeenCalledWith({ tokenId: "t-1" });
    });
});
