/**
 * Tests for the civilian Profile page — the "Dashcam Mode" entry point (only rendered once the
 * user has at least one registered device) and the "Install app" row (OS-aware: uses the native
 * browser prompt when available, otherwise opens manual instructions — iOS-specific steps, or a
 * generic fallback for other browsers that haven't offered the prompt yet).
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfilePage from "@/app/(civilian)/profile/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/app/api/generated/user-profile/user-profile", () => ({
    useGetProfile: () => ({
        data: {
            data: {
                firstName: "Jane",
                lastName: "Doe",
                email: "jane@example.com",
                phoneNumber: "0821234567",
                role: "CIVILIAN",
                createdAt: "2024-01-01T00:00:00Z",
            },
        },
        refetch: jest.fn(),
        isLoading: false,
    }),
    useUpdateProfile: () => ({ mutate: jest.fn(), isPending: false }),
    useDeleteAccount: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/app/api/generated/messages/messages", () => ({
    useSend: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/app/api/generated/devices/devices", () => ({
    useGenerateToken: () => ({ mutate: jest.fn(), isPending: false }),
    useRevokeToken1: () => ({ mutate: jest.fn(), isPending: false }),
}));

const mockUseListDevices = jest.fn();
jest.mock("@/lib/deviceTokens", () => ({
    useListDevices: () => mockUseListDevices(),
}));

const renderWithClient = (ui: React.ReactElement) =>
    render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

function makeBeforeInstallPromptEvent(prompt: jest.Mock) {
    const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    };
    event.prompt = prompt;
    event.userChoice = Promise.resolve({ outcome: "accepted" as const });
    return event;
}

describe("ProfilePage — Install app row", () => {
    beforeEach(() => {
        mockUseListDevices.mockReturnValue({ data: { data: [] }, isLoading: false, refetch: jest.fn() });
    });

    it("shows the row by default and opens generic instructions when no native prompt is available", async () => {
        renderWithClient(<ProfilePage />);
        const user = userEvent.setup();
        await user.click(await screen.findByText("Install app"));

        expect(await screen.findByText("Install Reporthole")).toBeInTheDocument();
        expect(screen.getByText(/Open your browser's menu/i)).toBeInTheDocument();
    });

    it("triggers the native prompt directly instead of instructions when beforeinstallprompt has fired", async () => {
        const prompt = jest.fn().mockResolvedValue(undefined);
        renderWithClient(<ProfilePage />);
        window.dispatchEvent(makeBeforeInstallPromptEvent(prompt));

        const user = userEvent.setup();
        await user.click(await screen.findByText("Install app"));

        await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
        expect(screen.queryByText("Install Reporthole")).not.toBeInTheDocument();
    });

    it("shows iOS-specific Add to Home Screen instructions on iOS", async () => {
        const originalUA = navigator.userAgent;
        Object.defineProperty(navigator, "userAgent", {
            value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
            configurable: true,
        });
        try {
            renderWithClient(<ProfilePage />);
            const user = userEvent.setup();
            await user.click(await screen.findByText("Install app"));

            expect(await screen.findByText(/Add to Home Screen/i)).toBeInTheDocument();
        } finally {
            Object.defineProperty(navigator, "userAgent", { value: originalUA, configurable: true });
        }
    });

    it("hides the row entirely when already running standalone", async () => {
        Object.defineProperty(navigator, "standalone", { value: true, configurable: true });
        try {
            renderWithClient(<ProfilePage />);
            await screen.findByText("My Profile");
            expect(screen.queryByText("Install app")).not.toBeInTheDocument();
        } finally {
            Object.defineProperty(navigator, "standalone", { value: undefined, configurable: true });
        }
    });
});

describe("ProfilePage — Dashcam Mode entry point", () => {
    it("does not show the Dashcam Mode link when no devices are registered", async () => {
        mockUseListDevices.mockReturnValue({ data: { data: [] }, isLoading: false, refetch: jest.fn() });
        renderWithClient(<ProfilePage />);

        await screen.findByText("My Profile");
        expect(screen.queryByText("Dashcam Mode")).not.toBeInTheDocument();
    });

    it("shows the Dashcam Mode link once a device is registered", async () => {
        mockUseListDevices.mockReturnValue({
            data: { data: [{ deviceId: "d-1", tokenPreview: "····a1b2c3d4", createdAt: "2024-01-01T00:00:00Z" }] },
            isLoading: false,
            refetch: jest.fn(),
        });
        renderWithClient(<ProfilePage />);

        const link = await screen.findByText("Dashcam Mode");
        expect(link.closest("a")).toHaveAttribute("href", "/dashcam");
    });
});
