import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

describe("LandingPage", () => {
    it("renders the app name", () => {
        render(<LandingPage />);
        expect(screen.getByText("Reporthole")).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
        render(<LandingPage />);
        expect(screen.getByText(/report road issues/i)).toBeInTheDocument();
    });

    it("has a Sign In link pointing to /login", () => {
        render(<LandingPage />);
        const link = screen.getByRole("link", { name: /sign in/i });
        expect(link).toHaveAttribute("href", "/login");
    });

    it("has a Create Account link pointing to /register", () => {
        render(<LandingPage />);
        const link = screen.getByRole("link", { name: /create account/i });
        expect(link).toHaveAttribute("href", "/register");
    });
});
