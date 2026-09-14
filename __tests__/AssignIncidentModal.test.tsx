import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AssignIncidentModal from "@/app/(admin)/_components/incidents/AssignIncidentModal";
import { useGetContractors } from "@/app/api/generated/admin-contractors/admin-contractors";

jest.mock("@/app/api/generated/admin-contractors/admin-contractors", () => ({
    useGetContractors: jest.fn(),
}));

const mockUseGetContractors = useGetContractors as jest.Mock;

const incidents = [{ incidentId: "inc-1", label: "Pothole — Main Road", issueType: "POTHOLE" }];

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

function renderModal() {
    return render(
        <QueryClientProvider client={queryClient}>
            <AssignIncidentModal open onClose={jest.fn()} incidents={incidents} />
        </QueryClientProvider>
    );
}

async function selectIncident() {
    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Incident"));
    await user.click(await screen.findByRole("option", { name: "Pothole — Main Road" }));
    return user;
}

describe("AssignIncidentModal contractor eligibility", () => {
    it("shows a contractor specialised in the exact issue type", async () => {
        mockUseGetContractors.mockReturnValue({
            data: {
                data: [
                    { userId: "c-1", firstName: "Pat", lastName: "Pothole", specialisations: ["POTHOLE"] },
                ],
            },
            isLoading: false,
        });
        renderModal();

        const user = await selectIncident();
        await user.click(screen.getByLabelText("Contractor"));

        expect(await screen.findByRole("option", { name: "Pat Pothole" })).toBeInTheDocument();
    });

    it("shows a contractor specialised in OTHER regardless of the incident's issue type", async () => {
        // Regression test: a contractor who handles "any" issue type (specialisation OTHER)
        // used to be filtered out of every incident-specific assignment list because the
        // filter only matched the exact issue type, never OTHER.
        mockUseGetContractors.mockReturnValue({
            data: {
                data: [
                    { userId: "c-2", firstName: "Gene", lastName: "Ralist", specialisations: ["OTHER"] },
                ],
            },
            isLoading: false,
        });
        renderModal();

        const user = await selectIncident();
        await user.click(screen.getByLabelText("Contractor"));

        expect(await screen.findByRole("option", { name: "Gene Ralist" })).toBeInTheDocument();
    });

    it("hides a contractor specialised in an unrelated issue type", async () => {
        mockUseGetContractors.mockReturnValue({
            data: {
                data: [
                    { userId: "c-3", firstName: "Sam", lastName: "Signage", specialisations: ["DAMAGED_SIGN"] },
                ],
            },
            isLoading: false,
        });
        renderModal();

        const user = await selectIncident();
        await user.click(screen.getByLabelText("Contractor"));

        expect(screen.queryByRole("option", { name: "Sam Signage" })).not.toBeInTheDocument();
        expect(screen.getByText("No contractors are specialised in this issue type yet.")).toBeInTheDocument();
    });
});
