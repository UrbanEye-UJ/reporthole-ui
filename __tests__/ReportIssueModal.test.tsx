import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import ReportIssueModal from "@/components/shared/ReportIssueModal";

const mockCreateMutate = jest.fn();
const mockConfirmMutate = jest.fn();

jest.mock("@/app/api/generated/incidents/incidents", () => ({
    useCreateIncident: ({ mutation }: { mutation: { onSuccess: Function; onError: Function } }) => ({
        mutate: (payload: unknown) => mockCreateMutate(payload, mutation),
        isPending: false,
    }),
    useConfirmDuplicate: ({ mutation }: { mutation: { onSuccess: Function; onError: Function } }) => ({
        mutate: (payload: unknown) => mockConfirmMutate(payload, mutation),
        isPending: false,
    }),
}));

const mockGeolocation = { getCurrentPosition: jest.fn() };

beforeAll(() => {
    Object.defineProperty(navigator, "geolocation", { value: mockGeolocation, configurable: true });
    (URL.createObjectURL as jest.Mock) = jest.fn(() => "blob:mock-preview");
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }) as any);
});

beforeEach(() => {
    mockGeolocation.getCurrentPosition.mockReset();
    mockCreateMutate.mockReset();
    mockConfirmMutate.mockReset();
});

async function fillForm() {
    fireEvent.change(screen.getByPlaceholderText("Describe the issue..."), {
        target: { value: "Big pothole" },
    });
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    const input = document.querySelector("input[type='file']") as HTMLInputElement;
    await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
    });
}

describe("ReportIssueModal", () => {
    describe("visibility", () => {
        it("does not render when visible is false", () => {
            render(<ReportIssueModal visible={false} onClose={jest.fn()} />);
            expect(screen.queryByText("Report Issue")).not.toBeInTheDocument();
        });

        it("renders when visible is true", () => {
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            expect(screen.getByText("Report Issue")).toBeInTheDocument();
        });
    });

    describe("closing", () => {
        it("calls onClose when Cancel is clicked", () => {
            const onClose = jest.fn();
            render(<ReportIssueModal visible={true} onClose={onClose} />);
            fireEvent.click(screen.getByText("Cancel"));
            expect(onClose).toHaveBeenCalled();
        });

        it("calls onClose when backdrop is clicked", () => {
            const onClose = jest.fn();
            const { container } = render(<ReportIssueModal visible={true} onClose={onClose} />);
            fireEvent.click(container.firstChild as Element);
            expect(onClose).toHaveBeenCalled();
        });
    });

    describe("submit validation", () => {
        it("submit button is disabled when description and image are missing", () => {
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
        });

        it("submit button is disabled when only description is filled", () => {
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            fireEvent.change(screen.getByPlaceholderText("Describe the issue..."), {
                target: { value: "Big pothole" },
            });
            expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
        });
    });

    describe("image upload", () => {
        it("shows preview after file is selected", async () => {
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            const input = document.querySelector("input[type='file']") as HTMLInputElement;
            await act(async () => {
                fireEvent.change(input, { target: { files: [file] } });
            });
            expect(screen.getByAltText("Preview")).toBeInTheDocument();
        });

        it("shows retake button after image is selected", async () => {
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            const input = document.querySelector("input[type='file']") as HTMLInputElement;
            await act(async () => {
                fireEvent.change(input, { target: { files: [file] } });
            });
            expect(screen.getByText("Retake")).toBeInTheDocument();
        });
    });

    describe("geolocation", () => {
        it("requests geolocation automatically when modal opens", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation(() => {});
            await act(async () => {
                render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            });
            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
        });

        it("shows coordinates after successful geolocation on open", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation((success: Function) =>
                success({ coords: { latitude: -26.2041, longitude: 28.0473 } })
            );
            await act(async () => {
                render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            });
            expect(screen.getByText(/-26\.20/)).toBeInTheDocument();
        });

        it("shows error when geolocation fails on open", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation((_: unknown, error: Function) =>
                error({ code: 1, message: "denied" })
            );
            await act(async () => {
                render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            });
            expect(
                screen.getByText(/Could not get your location/i)
            ).toBeInTheDocument();
        });
    });

    describe("submit flow — no duplicate", () => {
        it("shows success screen after successful submission", async () => {
            mockCreateMutate.mockImplementation((_: unknown, { onSuccess }: { onSuccess: Function }) =>
                onSuccess({ data: { duplicate: false, incidentId: "abc-123" } })
            );

            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("Report Submitted")).toBeInTheDocument();
            });
        });

        it("calls onClose when Done is clicked on success screen", async () => {
            mockCreateMutate.mockImplementation((_: unknown, { onSuccess }: { onSuccess: Function }) =>
                onSuccess({ data: { duplicate: false, incidentId: "abc-123" } })
            );

            const onClose = jest.fn();
            render(<ReportIssueModal visible={true} onClose={onClose} />);
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => screen.getByText("Done"));
            fireEvent.click(screen.getByText("Done"));
            expect(onClose).toHaveBeenCalled();
        });

        it("shows error message when mutation fails", async () => {
            mockCreateMutate.mockImplementation((_: unknown, { onError }: { onError: Function }) => onError(new Error("fail")));

            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
            });
        });
    });

    describe("submit flow — duplicate detected", () => {
        const OTHER_USER_ID = "other-user-uuid";
        const OWN_USER_ID = "own-user-uuid";

        // JWT with sub=own-user-uuid (header.payload.sig — sig is fake, only payload is read)
        const jwtWithOwnId = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ sub: OWN_USER_ID }))}.sig`;

        const duplicateData = {
            duplicate: true,
            existingIncidentId: "existing-123",
            incidentType: "POTHOLE",
            incidentDate: "2026-06-14T10:00:00",
            reportCount: 2,
            description: "Pothole on Main Road",
            imageUrl: "http://localhost:8080/api/uploads/incidents/test.jpg",
            userId: OTHER_USER_ID,
        };

        beforeEach(() => {
            mockCreateMutate.mockImplementation((_: unknown, { onSuccess }: { onSuccess: Function }) =>
                onSuccess({ data: duplicateData })
            );
        });

        it("shows duplicate confirmation screen when duplicate is detected", async () => {
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("Similar Issue Already Reported")).toBeInTheDocument();
            });
            expect(screen.getByText("Yes, same issue")).toBeInTheDocument();
            expect(screen.getByText("No, it's a different issue")).toBeInTheDocument();
            const img = screen.getByAltText("Reported incident");
            expect(img).toBeInTheDocument();
            expect(img.getAttribute("src")).toContain("image-proxy");
        });

        it("shows own-report message when the duplicate was submitted by the current user", async () => {
            Object.defineProperty(document, "cookie", {
                get: () => `reporthole_token=${jwtWithOwnId}`,
                configurable: true,
            });
            mockCreateMutate.mockImplementationOnce((_: unknown, { onSuccess }: { onSuccess: Function }) =>
                onSuccess({ data: { ...duplicateData, userId: OWN_USER_ID } })
            );

            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("You Already Reported This")).toBeInTheDocument();
            });

            // restore
            Object.defineProperty(document, "cookie", { get: () => "", configurable: true });
        });

        it("shows own-report message when alreadyConfirmed is true (previous confirmer)", async () => {
            mockCreateMutate.mockImplementationOnce((_: unknown, { onSuccess }: { onSuccess: Function }) =>
                onSuccess({ data: { ...duplicateData, alreadyConfirmed: true } })
            );

            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("You Already Reported This")).toBeInTheDocument();
            });
        });

        it("calls confirm mutation and shows success when user confirms duplicate", async () => {
            mockConfirmMutate.mockImplementation((_: unknown, { onSuccess }: { onSuccess: Function }) =>
                onSuccess({ data: { reportCount: 3 } })
            );

            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });
            await waitFor(() => screen.getByText("Yes, same issue"));

            await act(async () => {
                fireEvent.click(screen.getByText("Yes, same issue"));
            });

            await waitFor(() => {
                expect(screen.getByText("Report Submitted")).toBeInTheDocument();
            });
            expect(mockConfirmMutate).toHaveBeenCalledWith(
                expect.objectContaining({ id: "existing-123" }),
                expect.anything()
            );
        });

        it("re-submits with forceCreate when user says it is a different issue", async () => {
            mockCreateMutate
                .mockImplementationOnce((_: unknown, { onSuccess }: { onSuccess: Function }) =>
                    onSuccess({ data: duplicateData })
                )
                .mockImplementationOnce((_: unknown, { onSuccess }: { onSuccess: Function }) =>
                    onSuccess({ data: { duplicate: false, incidentId: "new-456" } })
                );

            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });
            await waitFor(() => screen.getByText("No, it's a different issue"));

            await act(async () => {
                fireEvent.click(screen.getByText("No, it's a different issue"));
            });

            await waitFor(() => {
                expect(screen.getByText("Report Submitted")).toBeInTheDocument();
            });

            const secondCallPayload = mockCreateMutate.mock.calls[1][0];
            expect(secondCallPayload.data.forceCreate).toBe(true);
        });
    });
});
