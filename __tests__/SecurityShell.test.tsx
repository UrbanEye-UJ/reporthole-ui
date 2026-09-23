/**
 * Tests for SecurityShell's responsive behaviour: a permanent sidebar on
 * desktop vs. an off-canvas Drawer (hidden until the hamburger is tapped)
 * below the md breakpoint.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SecurityShell from "@/app/(security)/_components/SecurityShell";

jest.mock("next/navigation", () => ({
    usePathname: () => "/security",
    useRouter: () => ({ push: jest.fn() }),
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

const renderShell = () => render(<SecurityShell mode="light" toggleMode={jest.fn()}>content</SecurityShell>);

describe("SecurityShell", () => {
    it("shows a permanent, always-visible sidebar on desktop with no hamburger", () => {
        setViewport(false);
        renderShell();

        expect(screen.getByText("Admin Applications")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /open menu/i })).not.toBeInTheDocument();
    });

    it("hides the sidebar behind a hamburger on mobile, opened on click", async () => {
        setViewport(true);
        renderShell();

        // Drawer is rendered with keepMounted, so the nav is present but not visible while closed.
        expect(screen.getByText("Admin Applications")).not.toBeVisible();

        fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

        await waitFor(() => expect(screen.getByText("Admin Applications")).toBeVisible());
    });

    it("closes the mobile drawer when a nav link is clicked", async () => {
        setViewport(true);
        renderShell();

        fireEvent.click(screen.getByRole("button", { name: /open menu/i }));
        const navLink = await screen.findByText("Admin Applications");
        await waitFor(() => expect(navLink).toBeVisible());
        fireEvent.click(navLink);

        await waitFor(() => expect(navLink).not.toBeVisible());
    });
});
