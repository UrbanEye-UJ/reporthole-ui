import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import ReportIssueModal from "@/components/shared/ReportIssueModal";

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
});

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
        it("requests geolocation when location button is clicked", () => {
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            fireEvent.click(screen.getByText("Use my current location"));
            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
        });

        it("shows coordinates after successful geolocation", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation((success: any) =>
                success({ coords: { latitude: -26.2041, longitude: 28.0473 } })
            );
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            await act(async () => {
                fireEvent.click(screen.getByText("Use my current location"));
            });
            expect(screen.getByText(/-26\.20/)).toBeInTheDocument();
        });

        it("shows error when geolocation fails", async () => {
            mockGeolocation.getCurrentPosition.mockImplementation((_: any, error: any) => error());
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);
            await act(async () => {
                fireEvent.click(screen.getByText("Use my current location"));
            });
            expect(screen.getByText("Could not get your location. Please try again.")).toBeInTheDocument();
        });
    });

    describe("submit flow", () => {
        it("shows success screen after submitting with description and image", async () => {
            render(<ReportIssueModal visible={true} onClose={jest.fn()} />);

            fireEvent.change(screen.getByPlaceholderText("Describe the issue..."), {
                target: { value: "Big pothole" },
            });

            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            const input = document.querySelector("input[type='file']") as HTMLInputElement;
            await act(async () => {
                fireEvent.change(input, { target: { files: [file] } });
            });

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => {
                expect(screen.getByText("Report Submitted")).toBeInTheDocument();
            }, { timeout: 2000 });
        });

        it("calls onClose when Done is clicked on success screen", async () => {
            const onClose = jest.fn();
            render(<ReportIssueModal visible={true} onClose={onClose} />);

            fireEvent.change(screen.getByPlaceholderText("Describe the issue..."), {
                target: { value: "Crack in road" },
            });

            const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
            const input = document.querySelector("input[type='file']") as HTMLInputElement;
            await act(async () => {
                fireEvent.change(input, { target: { files: [file] } });
            });

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            await waitFor(() => screen.getByText("Done"), { timeout: 2000 });
            fireEvent.click(screen.getByText("Done"));
            expect(onClose).toHaveBeenCalled();
        });
    });
});
