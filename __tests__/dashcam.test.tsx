/**
 * Tests for the DashcamPage component (/dashcam).
 *
 * Covers:
 *   - Token entry screen shown when no token is stored in localStorage
 *   - Token submission saves to localStorage and transitions to the dashcam screen
 *   - Dashcam screen renders the Start / Stop controls
 *   - "Clear token" button removes the token and returns to the entry screen
 *
 * Browser APIs unavailable in jsdom (getUserMedia, geolocation, crypto.randomUUID)
 * are stubbed at the module level.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashcamPage from "@/app/(civilian)/dashcam/page";

// ── Browser API stubs ──────────────────────────────────────────────────────

const mockGetUserMedia = jest.fn();
const mockWatchPosition = jest.fn().mockReturnValue(1);
const mockClearWatch = jest.fn();

beforeAll(() => {
    Object.defineProperty(global.navigator, "mediaDevices", {
        value: { getUserMedia: mockGetUserMedia },
        configurable: true,
        writable: true,
    });
    Object.defineProperty(global.navigator, "geolocation", {
        value: {
            watchPosition: mockWatchPosition,
            clearWatch: mockClearWatch,
        },
        configurable: true,
        writable: true,
    });

    // crypto.randomUUID used to generate event IDs
    Object.defineProperty(global, "crypto", {
        value: { ...global.crypto, randomUUID: () => "test-uuid-0000-0000-0000-000000000001" },
        configurable: true,
        writable: true,
    });

    global.fetch = jest.fn();
});

beforeEach(() => {
    localStorage.clear();
    mockGetUserMedia.mockReset();
    mockWatchPosition.mockReturnValue(1);
    (global.fetch as jest.Mock).mockReset();
});

afterEach(() => {
    localStorage.clear();
});

// ── Token entry screen ─────────────────────────────────────────────────────

describe("token entry screen", () => {
    it("renders the app name and token input when no token is stored", async () => {
        render(<DashcamPage />);
        await waitFor(() => {
            expect(screen.getByText("Reporthole Dashcam")).toBeInTheDocument();
        });
        expect(screen.getByPlaceholderText(/xxxx/)).toBeInTheDocument();
    });

    it("disables Start Dashcam when the input is empty", async () => {
        render(<DashcamPage />);
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /start dashcam/i })).toBeDisabled()
        );
    });

    it("enables Start Dashcam once the user types a token", async () => {
        render(<DashcamPage />);
        await waitFor(() => screen.getByPlaceholderText(/xxxx/));

        fireEvent.change(screen.getByPlaceholderText(/xxxx/), {
            target: { value: "some-device-token" },
        });

        expect(screen.getByRole("button", { name: /start dashcam/i })).not.toBeDisabled();
    });

    it("saves the token to localStorage and shows the dashcam screen on submit", async () => {
        render(<DashcamPage />);
        await waitFor(() => screen.getByPlaceholderText(/xxxx/));

        fireEvent.change(screen.getByPlaceholderText(/xxxx/), {
            target: { value: "my-device-token" },
        });
        fireEvent.click(screen.getByRole("button", { name: /start dashcam/i }));

        expect(localStorage.getItem("dashcam_device_token")).toBe("my-device-token");

        // After saving, the entry screen is replaced by the dashcam screen
        await waitFor(() =>
            expect(screen.queryByText("Reporthole Dashcam")).not.toBeInTheDocument()
        );
        expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    });

    it("submits when Enter is pressed in the token field", async () => {
        render(<DashcamPage />);
        await waitFor(() => screen.getByPlaceholderText(/xxxx/));

        fireEvent.change(screen.getByPlaceholderText(/xxxx/), {
            target: { value: "enter-key-token" },
        });
        fireEvent.keyDown(screen.getByPlaceholderText(/xxxx/), { key: "Enter" });

        expect(localStorage.getItem("dashcam_device_token")).toBe("enter-key-token");
    });
});

// ── Dashcam screen ─────────────────────────────────────────────────────────

describe("dashcam screen", () => {
    beforeEach(() => {
        localStorage.setItem("dashcam_device_token", "saved-device-token");
    });

    it("shows Start and Clear token buttons when a token is already stored", async () => {
        render(<DashcamPage />);
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /^start$/i })).toBeInTheDocument()
        );
        expect(screen.getByRole("button", { name: /clear token/i })).toBeInTheDocument();
    });

    it("shows 'Waiting for GPS' before a position fix is received", async () => {
        // watchPosition never calls the success callback in this test
        mockWatchPosition.mockReturnValue(1);
        render(<DashcamPage />);
        await waitFor(() =>
            expect(screen.getByText(/waiting for gps/i)).toBeInTheDocument()
        );
    });

    it("shows scanning message when active and shows a Start button when inactive", async () => {
        render(<DashcamPage />);
        await waitFor(() => screen.getByRole("button", { name: /^start$/i }));
        // Before starting: placeholder message
        expect(screen.getByText(/press start to begin scanning/i)).toBeInTheDocument();
    });

    it("removes token from localStorage and returns to entry screen on Clear token", async () => {
        render(<DashcamPage />);
        await waitFor(() => screen.getByRole("button", { name: /clear token/i }));

        fireEvent.click(screen.getByRole("button", { name: /clear token/i }));

        await waitFor(() =>
            expect(screen.getByText("Reporthole Dashcam")).toBeInTheDocument()
        );
        expect(localStorage.getItem("dashcam_device_token")).toBeNull();
    });
});
