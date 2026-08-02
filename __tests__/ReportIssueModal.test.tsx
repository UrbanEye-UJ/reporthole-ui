import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportIssueModal from "@/components/shared/ReportIssueModal";

const mockCreateMutate = jest.fn();
const mockConfirmMutate = jest.fn();
const mockPredictMutateAsync = jest.fn();

type MutationHandlers = { onSuccess: (result: unknown) => void; onError: (err: unknown) => void };

jest.mock("@/app/api/generated/incidents/incidents", () => ({
    useCreateIncident: ({ mutation }: { mutation: MutationHandlers }) => ({
        mutate: (payload: unknown) => mockCreateMutate(payload, mutation),
        isPending: false,
    }),
    useConfirmDuplicate: ({ mutation }: { mutation: MutationHandlers }) => ({
        mutate: (payload: unknown) => mockConfirmMutate(payload, mutation),
        isPending: false,
    }),
}));

jest.mock("@/app/api/generated/inference/inference", () => ({
    usePredict: () => ({ mutateAsync: mockPredictMutateAsync }),
}));

const mockGeolocation = { getCurrentPosition: jest.fn() };

beforeAll(() => {
    Object.defineProperty(navigator, "geolocation", { value: mockGeolocation, configurable: true });
    (URL.createObjectURL as jest.Mock) = jest.fn(() => "blob:mock-preview");
    global.fetch = jest.fn(() => Promise.resolve({ ok: true } as unknown as Response));
    // jsdom does not implement createImageBitmap or canvas drawing APIs
    global.createImageBitmap = jest.fn(async () => ({ width: 100, height: 100, close: jest.fn() }));
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({ drawImage: jest.fn() })) as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toBlob = jest.fn((cb: BlobCallback) => cb(new Blob(["img"])));
});

beforeEach(() => {
    mockGeolocation.getCurrentPosition.mockReset();
    mockCreateMutate.mockReset();
    mockConfirmMutate.mockReset();
    mockPredictMutateAsync.mockReset();
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });
});

function renderModal(props: { visible: boolean; onClose?: () => void }) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <ReportIssueModal visible={props.visible} onClose={props.onClose ?? jest.fn()} />
        </QueryClientProvider>
    );
}

/** Navigates past the mode chooser and fills the manual form. */
async function fillForm() {
    // Navigate from choose → form
    fireEvent.click(screen.getByText("Report Manually"));

    fireEvent.change(screen.getByPlaceholderText("Describe the issue..."), {
        target: { value: "Big pothole" },
    });
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    // After the form step, there are two file inputs (camera + gallery).
    // Use the gallery input (no capture attribute) as it accepts files in tests.
    const galleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
        (el) => !(el as HTMLInputElement).hasAttribute("capture")
    ) as HTMLInputElement;
    await act(async () => {
        fireEvent.change(galleryInput, { target: { files: [file] } });
    });
}

describe("ReportIssueModal", () => {
    describe("visibility", () => {
        it("does not render when visible is false", () => {
            renderModal({ visible: false });
            expect(screen.queryByText("Report an Issue")).not.toBeInTheDocument();
        });

        it("shows the mode chooser when visible is true", () => {
            renderModal({ visible: true });
            expect(screen.getByText("Report an Issue")).toBeInTheDocument();
            expect(screen.getByText("Detect with AI")).toBeInTheDocument();
            expect(screen.getByText("Report Manually")).toBeInTheDocument();
        });
    });

    describe("closing", () => {
        it("calls onClose when Cancel is clicked on the choose screen", () => {
            const onClose = jest.fn();
            renderModal({ visible: true, onClose });
            fireEvent.click(screen.getByText("Cancel"));
            expect(onClose).toHaveBeenCalled();
        });

        it("calls onClose when backdrop is clicked", () => {
            const onClose = jest.fn();
            const { container } = renderModal({ visible: true, onClose });
            fireEvent.click(container.firstChild as Element);
            expect(onClose).toHaveBeenCalled();
        });

        it("calls onClose when Cancel is clicked on the form step", () => {
            const onClose = jest.fn();
            renderModal({ visible: true, onClose });
            fireEvent.click(screen.getByText("Report Manually"));
            // Two Cancel buttons exist — click the one inside the form
            fireEvent.click(screen.getByText("Cancel"));
            expect(onClose).toHaveBeenCalled();
        });
    });

    describe("mode chooser navigation", () => {
        it("shows the form when Report Manually is selected", () => {
            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Report Manually"));
            expect(screen.getByPlaceholderText("Describe the issue...")).toBeInTheDocument();
        });

        it("shows the AI-detect step when Detect with AI is selected", () => {
            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Detect with AI"));
            expect(screen.getByText("Take Photo")).toBeInTheDocument();
            expect(screen.getByText("Upload Photo")).toBeInTheDocument();
        });

        it("back arrow from form returns to the mode chooser", () => {
            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Report Manually"));
            // Click the back arrow (aria role is button, only arrow in form header)
            const backButtons = screen.getAllByRole("button");
            fireEvent.click(backButtons[0]); // first button is the back arrow
            expect(screen.getByText("Report an Issue")).toBeInTheDocument();
        });
    });

    describe("submit validation (form step)", () => {
        it("submit button is disabled when description and image are missing", () => {
            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Report Manually"));
            expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
        });

        it("submit button is disabled when only description is filled", () => {
            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Report Manually"));
            fireEvent.change(screen.getByPlaceholderText("Describe the issue..."), {
                target: { value: "Big pothole" },
            });
            expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
        });
    });

    describe("image upload (form step)", () => {
        it("shows Take Photo and Upload Photo buttons before image is selected", () => {
            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Report Manually"));
            expect(screen.getByText("Take Photo")).toBeInTheDocument();
            expect(screen.getByText("Upload Photo")).toBeInTheDocument();
        });

        it("shows preview after file is selected via gallery input", async () => {
            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Report Manually"));
            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            const galleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;
            await act(async () => {
                fireEvent.change(galleryInput, { target: { files: [file] } });
            });
            expect(screen.getByAltText("Preview")).toBeInTheDocument();
        });

        it("shows retake button after image is selected", async () => {
            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Report Manually"));
            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            const galleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;
            await act(async () => {
                fireEvent.change(galleryInput, { target: { files: [file] } });
            });
            expect(screen.getByText("Retake")).toBeInTheDocument();
        });
    });

    describe("geolocation", () => {
        it("requests geolocation automatically when modal opens", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation(() => {});
            await act(async () => {
                renderModal({ visible: true });
            });
            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
        });

        it("shows coordinates in form step after successful geolocation", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation((success: (pos: GeolocationPosition) => void) =>
                success({ coords: { latitude: -26.2041, longitude: 28.0473 } })
            );
            await act(async () => {
                renderModal({ visible: true });
            });
            fireEvent.click(screen.getByText("Report Manually"));
            expect(screen.getByText(/-26\.20/)).toBeInTheDocument();
        });

        it("shows error when geolocation fails on open", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation((_: unknown, error: (err: GeolocationPositionError) => void) =>
                error({ code: 1, message: "denied" })
            );
            await act(async () => {
                renderModal({ visible: true });
            });
            fireEvent.click(screen.getByText("Report Manually"));
            expect(
                screen.getByText(/Could not get your location/i)
            ).toBeInTheDocument();
        });
    });

    describe("submit flow — no duplicate", () => {
        it("shows success screen after successful submission", async () => {
            mockCreateMutate.mockImplementation((_: unknown, { onSuccess }: { onSuccess: (result: unknown) => void }) =>
                onSuccess({ data: { duplicate: false, incidentId: "abc-123" } })
            );

            renderModal({ visible: true });
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("Report Submitted")).toBeInTheDocument();
            });
        });

        it("calls onClose when Done is clicked on success screen", async () => {
            mockCreateMutate.mockImplementation((_: unknown, { onSuccess }: { onSuccess: (result: unknown) => void }) =>
                onSuccess({ data: { duplicate: false, incidentId: "abc-123" } })
            );

            const onClose = jest.fn();
            renderModal({ visible: true, onClose });
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => screen.getByText("Done"));
            fireEvent.click(screen.getByText("Done"));
            expect(onClose).toHaveBeenCalled();
        });

        it("shows error message when mutation fails", async () => {
            mockCreateMutate.mockImplementation((_: unknown, { onError }: { onError: (err: unknown) => void }) => onError(new Error("fail")));

            renderModal({ visible: true });
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
            mockCreateMutate.mockImplementation((_: unknown, { onSuccess }: { onSuccess: (result: unknown) => void }) =>
                onSuccess({ data: duplicateData })
            );
        });

        it("shows duplicate confirmation screen when duplicate is detected", async () => {
            renderModal({ visible: true });
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
            mockCreateMutate.mockImplementationOnce((_: unknown, { onSuccess }: { onSuccess: (result: unknown) => void }) =>
                onSuccess({ data: { ...duplicateData, userId: OWN_USER_ID } })
            );

            renderModal({ visible: true });
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("You Already Reported This")).toBeInTheDocument();
            });

            Object.defineProperty(document, "cookie", { get: () => "", configurable: true });
        });

        it("shows own-report message when alreadyConfirmed is true (previous confirmer)", async () => {
            mockCreateMutate.mockImplementationOnce((_: unknown, { onSuccess }: { onSuccess: (result: unknown) => void }) =>
                onSuccess({ data: { ...duplicateData, alreadyConfirmed: true } })
            );

            renderModal({ visible: true });
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("You Already Reported This")).toBeInTheDocument();
            });
        });

        it("calls confirm mutation and shows success when user confirms duplicate", async () => {
            mockConfirmMutate.mockImplementation((_: unknown, { onSuccess }: { onSuccess: (result: unknown) => void }) =>
                onSuccess({ data: { reportCount: 3 } })
            );

            renderModal({ visible: true });
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
                .mockImplementationOnce((_: unknown, { onSuccess }: { onSuccess: (result: unknown) => void }) =>
                    onSuccess({ data: duplicateData })
                )
                .mockImplementationOnce((_: unknown, { onSuccess }: { onSuccess: (result: unknown) => void }) =>
                    onSuccess({ data: { duplicate: false, incidentId: "new-456" } })
                );

            renderModal({ visible: true });
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

    describe("AI-detect flow", () => {
        it("shows loading overlay while analyzing", async () => {
            mockPredictMutateAsync.mockImplementation(() => new Promise(() => {}));

            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Detect with AI"));

            const file = new File(["img"], "road.jpg", { type: "image/jpeg" });
            const aiGalleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;

            await act(async () => {
                fireEvent.change(aiGalleryInput, { target: { files: [file] } });
            });

            expect(screen.getByText("Analyzing...")).toBeInTheDocument();
            expect(screen.getByAltText("AI analysis preview")).toBeInTheDocument();
        });

        it("shows AI prediction result when inference succeeds", async () => {
            mockPredictMutateAsync.mockResolvedValue({
                detected: true,
                detection: { label: "POTHOLE", confidence: 0.87, rawLabel: "Pothole_FP" },
            });

            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Detect with AI"));

            const aiGalleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;

            await act(async () => {
                fireEvent.change(aiGalleryInput, { target: { files: [new File(["img"], "road.jpg", { type: "image/jpeg" })] } });
            });

            await waitFor(() => {
                expect(screen.getByText("AI Detected")).toBeInTheDocument();
                expect(screen.getByText("POTHOLE")).toBeInTheDocument();
                expect(screen.getByText("87% confidence")).toBeInTheDocument();
            });
        });

        it("pre-fills form and switches to form step when user accepts AI prediction", async () => {
            mockPredictMutateAsync.mockResolvedValue({
                detected: true,
                detection: { label: "POTHOLE", confidence: 0.87, rawLabel: "Pothole_FP" },
            });

            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Detect with AI"));

            const aiGalleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;

            await act(async () => {
                fireEvent.change(aiGalleryInput, { target: { files: [new File(["img"], "road.jpg", { type: "image/jpeg" })] } });
            });

            await waitFor(() => screen.getByText("Yes, that looks right"));
            fireEvent.click(screen.getByText("Yes, that looks right"));

            // Should be on the form step now with pre-filled description
            expect(screen.getByPlaceholderText("Describe the issue...")).toBeInTheDocument();
            const descriptionField = screen.getByPlaceholderText("Describe the issue...") as HTMLTextAreaElement;
            expect(descriptionField.value).toContain("AI detected");
            expect(descriptionField.value).toContain("87%");
        });

        it("goes to manual form when user rejects AI prediction", async () => {
            mockPredictMutateAsync.mockResolvedValue({
                detected: true,
                detection: { label: "CRACK", confidence: 0.72, rawLabel: "Alligator_Crack_FP" },
            });

            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Detect with AI"));

            const aiGalleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;

            await act(async () => {
                fireEvent.change(aiGalleryInput, { target: { files: [new File(["img"], "road.jpg", { type: "image/jpeg" })] } });
            });

            await waitFor(() => screen.getByText("No, I'll select the type manually"));
            fireEvent.click(screen.getByText("No, I'll select the type manually"));

            expect(screen.getByPlaceholderText("Describe the issue...")).toBeInTheDocument();
        });

        it("shows error message when inference returns not detected", async () => {
            mockPredictMutateAsync.mockResolvedValue({
                detected: false,
                detection: { label: null, confidence: null, rawLabel: null },
            });

            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Detect with AI"));

            const aiGalleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;

            await act(async () => {
                fireEvent.change(aiGalleryInput, { target: { files: [new File(["img"], "road.jpg", { type: "image/jpeg" })] } });
            });

            await waitFor(() => {
                expect(screen.getByText(/No road damage detected/i)).toBeInTheDocument();
            });
            expect(screen.getByText("Report manually instead →")).toBeInTheDocument();
        });

        it("shows error message when inference service is unreachable", async () => {
            mockPredictMutateAsync.mockRejectedValue(new Error("Network error"));

            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Detect with AI"));

            const aiGalleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;

            await act(async () => {
                fireEvent.change(aiGalleryInput, { target: { files: [new File(["img"], "road.jpg", { type: "image/jpeg" })] } });
            });

            await waitFor(() => {
                expect(screen.getByText(/Could not reach the analysis service/i)).toBeInTheDocument();
            });
        });

        it("calls usePredict with the uploaded image", async () => {
            mockPredictMutateAsync.mockResolvedValue({
                detected: true,
                detection: { label: "POTHOLE", confidence: 0.90, rawLabel: "Pothole_FP" },
            });

            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Detect with AI"));

            const aiGalleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;

            await act(async () => {
                fireEvent.change(aiGalleryInput, { target: { files: [new File(["img"], "road.jpg", { type: "image/jpeg" })] } });
            });

            await waitFor(() => screen.getByText("AI Detected"));

            expect(mockPredictMutateAsync).toHaveBeenCalledWith({
                data: { image: expect.any(Blob) },
            });
        });
    });
});
