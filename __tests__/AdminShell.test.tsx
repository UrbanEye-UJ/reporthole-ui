/**
 * Tests for AdminShell's responsive behaviour: a permanent sidebar on desktop
 * vs. an off-canvas Drawer (hidden until the hamburger is tapped) below the
 * md breakpoint.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminShell from "@/app/(admin)/_components/layout/AdminShell";

jest.mock("next/navigation", () => ({
    usePathname: () => "/admin/dashboard",
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/lib/hooks/useNotifications", () => ({
    useNotifications: () => ({ data: [] }),
    useUnreadNotificationCount: () => ({ data: 0 }),
    useMarkAllNotificationsRead: () => ({ mutate: jest.fn() }),
}));

jest.mock("@/app/api/generated/user-profile/user-profile", () => ({
    useGetProfile: () => ({ data: { data: { firstName: "Jane" } } }),
}));

/** Overrides window.matchMedia so MUI's useMediaQuery(theme.breakpoints.down("md")) resolves as desired. */
function setViewport(matchesMobile: boolean) {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: matchesMobile,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }));
}

describe("AdminShell", () => {
    it("shows a permanent, always-visible sidebar on desktop with no hamburger", () => {
        setViewport(false);
        render(<AdminShell>content</AdminShell>);

        expect(screen.getByText("Operations Center")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /open menu/i })).not.toBeInTheDocument();
    });

    it("hides the sidebar behind a hamburger on mobile, opened on click", async () => {
        setViewport(true);
        render(<AdminShell>content</AdminShell>);

        // Drawer is rendered with keepMounted, so the nav is present but not visible while closed.
        expect(screen.getByText("Operations Center")).not.toBeVisible();

        fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

        await waitFor(() => expect(screen.getByText("Operations Center")).toBeVisible());
    });

    it("closes the mobile drawer when a nav link is clicked", async () => {
        setViewport(true);
        render(<AdminShell>content</AdminShell>);

        fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
        const navLink = await screen.findByText("Operations Center");
        await waitFor(() => expect(navLink).toBeVisible());
        fireEvent.click(navLink);

        await waitFor(() => expect(navLink).not.toBeVisible());
    });
});
