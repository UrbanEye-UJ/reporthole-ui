/**
 * Tests for the civilian Profile page — specifically the "Dashcam Mode" entry
 * point, which should only render once the user has at least one registered
 * device.
 */

import { render, screen } from "@testing-library/react";
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
