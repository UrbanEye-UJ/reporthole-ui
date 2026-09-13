import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

// ContactSection uses React Query — mock it so landing page tests don't need a QueryClientProvider
jest.mock("@/app/_landing/ContactSection", () => function MockContactSection(){return <section data-testid="contact-section" />});

describe("LandingPage", () => {
    it("renders the app name", () => {
        render(<LandingPage />);
        // "Reporthole" appears in both the header and hero — getAllByText confirms at least one
        expect(screen.getAllByText("Reporthole").length).toBeGreaterThan(0);
    });

    it("renders a hero heading", () => {
        render(<LandingPage />);
        // "Gauteng" appears in the hero and footer — confirm at least one element contains it
        expect(screen.getAllByText(/gauteng/i).length).toBeGreaterThan(0);
    });

    it("has a Sign In link pointing to /login", () => {
        render(<LandingPage />);
        // Multiple "Sign in" links exist (header + CTA) — verify they all point to /login
        const links = screen.getAllByRole("link", { name: /sign in/i });
        expect(links.length).toBeGreaterThan(0);
        links.forEach((link) => expect(link).toHaveAttribute("href", "/login"));
    });

    it("has a Create Account link pointing to /register", () => {
        render(<LandingPage />);
        // Multiple "Create account" links exist (header + CTA) — verify they all point to /register
        const links = screen.getAllByRole("link", { name: /create account/i });
        expect(links.length).toBeGreaterThan(0);
        links.forEach((link) => expect(link).toHaveAttribute("href", "/register"));
    });
});
