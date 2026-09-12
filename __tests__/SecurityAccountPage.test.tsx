import { render, screen, fireEvent } from "@testing-library/react";
import type { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import SecurityAccountPage from "@/app/(security)/security/account/page";

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

const mutations = {
    grant: jest.fn(),
    revoke: jest.fn(),
    suspend: jest.fn(),
    reactivate: jest.fn(),
    forceLogout: jest.fn(),
};

const asMutationHook =
    (fn: jest.Mock) =>
    ({ mutation }: { mutation: { onSuccess?: () => void } }) => ({
        mutate: (payload: unknown) => {
            fn(payload);
            mutation.onSuccess?.();
        },
        isPending: false,
    });

const TARGET = "11111111-1111-1111-1111-111111111111";

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock("@/app/api/generated/security-admin/security-admin", () => ({
    useListUsers: () => ({
        data: {
            data: [
                {
                    userId: TARGET,
                    name: "Terry Target",
                    email: "terry@example.com",
                    role: "CIVILIAN",
                    status: "ACTIVE",
                },
            ],
        },
        isLoading: false,
    }),
    getListUsersQueryKey: () => ["/admin/security/users"],
    useGrantRole: (o: { mutation: { onSuccess?: () => void } }) => asMutationHook(mutations.grant)(o),
    useRevokeRole: (o: { mutation: { onSuccess?: () => void } }) => asMutationHook(mutations.revoke)(o),
    useSuspend: (o: { mutation: { onSuccess?: () => void } }) => asMutationHook(mutations.suspend)(o),
    useReactivate: (o: { mutation: { onSuccess?: () => void } }) => asMutationHook(mutations.reactivate)(o),
    useForceLogout: (o: { mutation: { onSuccess?: () => void } }) => asMutationHook(mutations.forceLogout)(o),
}));

beforeEach(() => Object.values(mutations).forEach((m) => m.mockReset()));

const openManage = () => fireEvent.click(screen.getByRole("button", { name: "Manage" }));

describe("SecurityAccountPage", () => {
    it("lists users with name, email, role and id", () => {
        render(<SecurityAccountPage />);
        expect(screen.getByText("Terry Target")).toBeInTheDocument();
        expect(screen.getByText("terry@example.com")).toBeInTheDocument();
        expect(screen.getByText("CIVILIAN")).toBeInTheDocument();
        expect(screen.getByText(TARGET)).toBeInTheDocument();
    });

    it("suspends the selected account with a reason", () => {
        render(<SecurityAccountPage />);
        openManage();
        fireEvent.click(screen.getByRole("button", { name: /Suspend account/i }));
        fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: "compromised" } });
        fireEvent.click(screen.getByRole("button", { name: /^Confirm$/i }));

        expect(mutations.suspend).toHaveBeenCalledWith({
            userId: TARGET,
            data: { reason: "compromised" },
        });
    });

    it("grants a selected role with a reason", () => {
        render(<SecurityAccountPage />);
        openManage();
        fireEvent.click(screen.getByRole("button", { name: /Grant \/ change role/i }));
        fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: "promotion" } });
        fireEvent.click(screen.getByRole("button", { name: /^Confirm$/i }));

        expect(mutations.grant).toHaveBeenCalledWith({
            userId: TARGET,
            data: { role: "ADMIN", reason: "promotion" },
        });
    });

    it("does not submit an action without a reason", () => {
        render(<SecurityAccountPage />);
        openManage();
        fireEvent.click(screen.getByRole("button", { name: /Force logout/i }));
        fireEvent.click(screen.getByRole("button", { name: /^Confirm$/i }));
        expect(mutations.forceLogout).not.toHaveBeenCalled();
    });
});
