import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReportIssueModal from "@/components/shared/ReportIssueModal";

const mockMutateAsync = jest.fn().mockResolvedValue({ data: { incidentId: "1", incidentType: "POTHOLE" } });

jest.mock("@/app/api/generated/incidents/incidents", () => ({
    useCreateIncident: () => ({ mutateAsync: mockMutateAsync }),
}));

const mockGeolocation = {
    getCurrentPosition: jest.fn(),
};

beforeAll(() => {
    Object.defineProperty(navigator, "geolocation", {
        value: mockGeolocation,
        configurable: true,
    });
    (URL.createObjectURL as jest.Mock) = jest.fn(() => "blob:mock-preview");
});

beforeEach(() => {
    mockGeolocation.getCurrentPosition.mockReset();
    mockMutateAsync.mockClear();
});

const renderModal = (props: { visible: boolean; onClose?: () => void; onSuccess?: () => void }) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <ReportIssueModal
                visible={props.visible}
                onClose={props.onClose ?? jest.fn()}
                onSuccess={props.onSuccess ?? jest.fn()}
            />
        </QueryClientProvider>
    );
};

describe("ReportIssueModal", () => {
    describe("visibility", () => {
        it("does not render when visible is false", () => {
            renderModal({ visible: false });
            expect(screen.queryByText("Report Issue")).not.toBeInTheDocument();
        });

        it("renders when visible is true", () => {
            renderModal({ visible: true });
            expect(screen.getByText("Report Issue")).toBeInTheDocument();
        });
    });

    describe("closing", () => {
        it("calls onClose when Cancel is clicked", () => {
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
    });

    describe("submit validation", () => {
        it("submit button is disabled when description and image are missing", () => {
            renderModal({ visible: true });
            expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
        });

        it("submit button is disabled when only description is filled", () => {
            renderModal({ visible: true });
            fireEvent.change(screen.getByPlaceholderText("Describe the issue..."), {
                target: { value: "Big pothole" },
            });
            expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
        });
    });

    describe("image upload", () => {
        it("shows preview after file is selected", async () => {
            renderModal({ visible: true });
            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            const input = document.querySelector("input[type='file']") as HTMLInputElement;
            await act(async () => {
                fireEvent.change(input, { target: { files: [file] } });
            });
            expect(screen.getByAltText("Preview")).toBeInTheDocument();
        });

        it("shows retake button after image is selected", async () => {
            renderModal({ visible: true });
            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            const input = document.querySelector("input[type='file']") as HTMLInputElement;
            await act(async () => {
                fireEvent.change(input, { target: { files: [file] } });
            });
            expect(screen.getByText("Retake")).toBeInTheDocument();
        });
    });

    describe("geolocation", () => {
        it("requests geolocation when location button is clicked", () => {
            renderModal({ visible: true });
            fireEvent.click(screen.getByText("Use my current location"));
            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
        });

        it("shows coordinates after successful geolocation", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation((success: unknown) =>
                (success as (pos: object) => void)({ coords: { latitude: -26.2041, longitude: 28.0473 } })
            );
            renderModal({ visible: true });
            await act(async () => {
                fireEvent.click(screen.getByText("Use my current location"));
            });
            expect(screen.getByText(/-26\.20/)).toBeInTheDocument();
        });

        it("shows error when geolocation fails", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation((_: unknown, error: unknown) =>
                (error as (e: object) => void)({ code: 0, message: "unknown error" })
            );
            renderModal({ visible: true });
            await act(async () => {
                fireEvent.click(screen.getByText("Use my current location"));
            });
            expect(screen.getByText("Could not get your location. Please try again.")).toBeInTheDocument();
        });
    });

    describe("submit flow", () => {
        const setupReadyModal = async (onClose = jest.fn(), onSuccess = jest.fn()) => {
            mockGeolocation.getCurrentPosition.mockImplementation((success: unknown) =>
                (success as (pos: object) => void)({ coords: { latitude: -26.2041, longitude: 28.0473 } })
            );
            renderModal({ visible: true, onClose, onSuccess });

            fireEvent.change(screen.getByPlaceholderText("Describe the issue..."), {
                target: { value: "Big pothole" },
            });

            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            const input = document.querySelector("input[type='file']") as HTMLInputElement;
            await act(async () => {
                fireEvent.change(input, { target: { files: [file] } });
            });

            await act(async () => {
                fireEvent.click(screen.getByText("Use my current location"));
            });
        };

        it("shows success screen after submitting with description, image and location", async () => {
            await setupReadyModal();

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("Report Submitted")).toBeInTheDocument();
            }, { timeout: 2000 });
        });

        it("calls onClose when Done is clicked on success screen", async () => {
            const onClose = jest.fn();
            await setupReadyModal(onClose);

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => screen.getByText("Done"), { timeout: 2000 });
            fireEvent.click(screen.getByText("Done"));
            expect(onClose).toHaveBeenCalled();
        });
    });
});
