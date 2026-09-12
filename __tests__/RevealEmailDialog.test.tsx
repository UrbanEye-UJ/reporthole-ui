import { render, screen, fireEvent, act } from "@testing-library/react";
import RevealEmailDialog from "@/app/(admin)/_components/contractors/RevealEmailDialog";

const mockMutate = jest.fn();

type MutationHandlers = { onSuccess?: (result: unknown) => void };

jest.mock("@/app/api/generated/admin-contractors/admin-contractors", () => ({
    useRevealEmail: () => ({
        mutate: (payload: unknown, handlers: MutationHandlers) => mockMutate(payload, handlers),
        isPending: false,
        error: null,
        reset: jest.fn(),
    }),
}));

beforeEach(() => {
    mockMutate.mockReset();
});

describe("RevealEmailDialog", () => {
    it("submits the entered password against the given contractor id", async () => {
        render(
            <RevealEmailDialog
                open
                onClose={jest.fn()}
                contractorId="contractor-123"
                contractorName="Con Tractor"
            />
        );

        fireEvent.change(screen.getByLabelText("Your password"), { target: { value: "my-password" } });
        await act(async () => {
            fireEvent.click(screen.getByText("View Email"));
        });

        expect(mockMutate).toHaveBeenCalledWith(
            { id: "contractor-123", data: { password: "my-password" } },
            expect.objectContaining({ onSuccess: expect.any(Function) })
        );
    });

    it("shows the revealed email after a successful reveal", async () => {
        render(
            <RevealEmailDialog
                open
                onClose={jest.fn()}
                contractorId="contractor-123"
                contractorName="Con Tractor"
            />
        );

        fireEvent.change(screen.getByLabelText("Your password"), { target: { value: "my-password" } });
        await act(async () => {
            fireEvent.click(screen.getByText("View Email"));
        });

        const [, handlers] = mockMutate.mock.calls[0];
        act(() => {
            handlers.onSuccess({ data: { email: "con.tractor@example.com" } });
        });

        expect(screen.getByText("con.tractor@example.com")).toBeInTheDocument();
    });

    it("does not submit when the password field is empty", async () => {
        render(
            <RevealEmailDialog
                open
                onClose={jest.fn()}
                contractorId="contractor-123"
                contractorName="Con Tractor"
            />
        );

        await act(async () => {
            fireEvent.click(screen.getByText("View Email"));
        });

        expect(mockMutate).not.toHaveBeenCalled();
        expect(screen.getByText("Enter your password")).toBeInTheDocument();
    });
});
