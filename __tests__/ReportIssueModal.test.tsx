import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportIssueModal from "@/components/shared/ReportIssueModal";

const mockCreateMutate = jest.fn();
const mockConfirmMutate = jest.fn();
const mockPredictMutateAsync = jest.fn();
const mockUseGetNearbyIncidents = jest.fn(() => ({ data: undefined as { data: unknown[] } | undefined }));

type MutationHandlers = { onSuccess: (result: unknown) => void; onError: (err: unknown) => void };
type SuccessOnlyHandlers = { onSuccess?: (result: unknown) => void };

jest.mock("@/app/api/generated/incidents/incidents", () => ({
    // The component calls mutateAsync (not mutate) and handles rejection itself — see
    // submitIncident's try/catch, which is also what decides the offline-queue path.
    useCreateIncident: ({ mutation }: { mutation: SuccessOnlyHandlers }) => ({
        mutateAsync: (payload: unknown) => mockCreateMutate(payload, mutation),
        isPending: false,
    }),
    useConfirmDuplicate: ({ mutation }: { mutation: MutationHandlers }) => ({
        mutate: (payload: unknown) => mockConfirmMutate(payload, mutation),
        isPending: false,
    }),
    useGetNearbyIncidents: () => mockUseGetNearbyIncidents(),
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
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({ drawImage: jest.fn() })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toBlob = jest.fn((cb: BlobCallback) => cb(new Blob(["img"])));
});

beforeEach(() => {
    mockGeolocation.getCurrentPosition.mockReset();
    mockCreateMutate.mockReset();
    mockConfirmMutate.mockReset();
    mockPredictMutateAsync.mockReset();
    mockUseGetNearbyIncidents.mockReset();
    mockUseGetNearbyIncidents.mockReturnValue({ data: undefined });
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
                success({ coords: { latitude: -26.2041, longitude: 28.0473 } } as GeolocationPosition)
            );
            await act(async () => {
                renderModal({ visible: true });
            });
            fireEvent.click(screen.getByText("Report Manually"));
            expect(screen.getByText(/-26\.20/)).toBeInTheDocument();
        });

        it("shows error when geolocation fails on open", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation((_: unknown, error: (err: GeolocationPositionError) => void) =>
                error({ code: 1, message: "denied" } as GeolocationPositionError)
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

    describe("nearby incidents nudge", () => {
        beforeEach(() => {
            mockGeolocation.getCurrentPosition.mockImplementation((success: (pos: GeolocationPosition) => void) =>
                success({ coords: { latitude: -26.2041, longitude: 28.0473 } } as GeolocationPosition)
            );
        });

        it("shows a nudge when nearby incidents are returned", async () => {
            mockUseGetNearbyIncidents.mockReturnValue({
                data: { data: [{ incidentId: "1", incidentType: "POTHOLE", locationAddress: "Main Road" }] },
            });
            await act(async () => {
                renderModal({ visible: true });
            });
            fireEvent.click(screen.getByText("Report Manually"));
            expect(screen.getByText("1 issue already reported nearby")).toBeInTheDocument();
            expect(screen.getByText(/POTHOLE — Main Road/)).toBeInTheDocument();
        });

        it("does not show a nudge when there are no nearby incidents", async () => {
            mockUseGetNearbyIncidents.mockReturnValue({ data: { data: [] } });
            await act(async () => {
                renderModal({ visible: true });
            });
            fireEvent.click(screen.getByText("Report Manually"));
            expect(screen.queryByText(/already reported nearby/)).not.toBeInTheDocument();
        });

        it("dismisses the nudge when Dismiss is clicked", async () => {
            mockUseGetNearbyIncidents.mockReturnValue({
                data: { data: [{ incidentId: "1", incidentType: "POTHOLE", locationAddress: "Main Road" }] },
            });
            await act(async () => {
                renderModal({ visible: true });
            });
            fireEvent.click(screen.getByText("Report Manually"));
            fireEvent.click(screen.getByText("Dismiss"));
            expect(screen.queryByText("1 issue already reported nearby")).not.toBeInTheDocument();
        });
    });

    describe("submit flow — no duplicate", () => {
        it("shows success screen after successful submission", async () => {
            mockCreateMutate.mockImplementation((_: unknown, { onSuccess }: SuccessOnlyHandlers) => {
                const result = { data: { duplicate: false, incidentId: "abc-123" } };
                onSuccess?.(result);
                return Promise.resolve(result);
            });

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
            mockCreateMutate.mockImplementation((_: unknown, { onSuccess }: SuccessOnlyHandlers) => {
                const result = { data: { duplicate: false, incidentId: "abc-123" } };
                onSuccess?.(result);
                return Promise.resolve(result);
            });

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

        it("shows error message when the server rejects the mutation", async () => {
            // A plain Error (not an axios network error) — the real server responded, just with
            // a failure, so this must NOT be treated as an offline/queue-worthy failure.
            mockCreateMutate.mockImplementation(() => Promise.reject(new Error("fail")));

            renderModal({ visible: true });
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
            });
        });

        it("queues the report and shows the offline confirmation when the request never reaches the server", async () => {
            const networkError = Object.assign(new Error("Network Error"), { isAxiosError: true });
            mockCreateMutate.mockImplementation(() => Promise.reject(networkError));

            renderModal({ visible: true });
            await fillForm();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("Saved — will send when you're back online")).toBeInTheDocument();
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
            mockCreateMutate.mockImplementation((_: unknown, { onSuccess }: SuccessOnlyHandlers) => {
                const result = { data: duplicateData };
                onSuccess?.(result);
                return Promise.resolve(result);
            });
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
            mockCreateMutate.mockImplementationOnce((_: unknown, { onSuccess }: SuccessOnlyHandlers) => {
                const result = { data: { ...duplicateData, userId: OWN_USER_ID } };
                onSuccess?.(result);
                return Promise.resolve(result);
            });

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
            mockCreateMutate.mockImplementationOnce((_: unknown, { onSuccess }: SuccessOnlyHandlers) => {
                const result = { data: { ...duplicateData, alreadyConfirmed: true } };
                onSuccess?.(result);
                return Promise.resolve(result);
            });

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
                .mockImplementationOnce((_: unknown, { onSuccess }: SuccessOnlyHandlers) => {
                    const result = { data: duplicateData };
                    onSuccess?.(result);
                    return Promise.resolve(result);
                })
                .mockImplementationOnce((_: unknown, { onSuccess }: SuccessOnlyHandlers) => {
                    const result = { data: { duplicate: false, incidentId: "new-456" } };
                    onSuccess?.(result);
                    return Promise.resolve(result);
                });

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
                detection: { label: "POTHOLE", confidence: 0.72, rawLabel: "Pothole_FP" },
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
                expect(screen.getByText("72% confidence")).toBeInTheDocument();
            });
        });

        it("pre-fills form and switches to form step when user accepts AI prediction", async () => {
            mockPredictMutateAsync.mockResolvedValue({
                detected: true,
                detection: { label: "POTHOLE", confidence: 0.72, rawLabel: "Pothole_FP" },
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
            expect(descriptionField.value).toContain("72%");
        });

        it("auto-accepts and skips the confirmation prompt when confidence is above 75%", async () => {
            mockPredictMutateAsync.mockResolvedValue({
                detected: true,
                detection: { label: "POTHOLE", confidence: 0.95, rawLabel: "Pothole_FP" },
            });

            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Detect with AI"));

            const aiGalleryInput = Array.from(document.querySelectorAll("input[type='file']")).find(
                (el) => !(el as HTMLInputElement).hasAttribute("capture")
            ) as HTMLInputElement;

            await act(async () => {
                fireEvent.change(aiGalleryInput, { target: { files: [new File(["img"], "road.jpg", { type: "image/jpeg" })] } });
            });

            // Should land directly on the pre-filled form — no confirmation prompt shown.
            await waitFor(() => {
                expect(screen.getByPlaceholderText("Describe the issue...")).toBeInTheDocument();
            });
            expect(screen.queryByText("Yes, that looks right")).not.toBeInTheDocument();
            expect(screen.queryByText("No, I'll select the type manually")).not.toBeInTheDocument();
            const descriptionField = screen.getByPlaceholderText("Describe the issue...") as HTMLTextAreaElement;
            expect(descriptionField.value).toContain("95%");
        });

        it("still shows the confirmation prompt at exactly 75% confidence", async () => {
            mockPredictMutateAsync.mockResolvedValue({
                detected: true,
                detection: { label: "POTHOLE", confidence: 0.75, rawLabel: "Pothole_FP" },
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
                expect(screen.getByText("Yes, that looks right")).toBeInTheDocument();
            });
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
                detection: { label: "POTHOLE", confidence: 0.72, rawLabel: "Pothole_FP" },
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
