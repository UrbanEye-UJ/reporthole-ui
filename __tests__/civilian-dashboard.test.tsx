import { render, screen, fireEvent } from "@testing-library/react";
import CivilianDashboard from "@/app/(civilian)/civilian/dashboard/page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
}));

const setCookie = (value: string) => {
    Object.defineProperty(document, "cookie", {
        value,
        configurable: true,
        writable: true,
    });
};

beforeEach(() => {
    mockPush.mockClear();
    setCookie("reporthole_token=test-token; reporthole_role=CIVILIAN");
});

describe("CivilianDashboard", () => {
    describe("rendering", () => {
        it("renders the app name", () => {
            render(<CivilianDashboard />);
            expect(screen.getByText("Reporthole")).toBeInTheDocument();
        });

        it("renders the Report Issue button", () => {
            render(<CivilianDashboard />);
            expect(screen.getByRole("button", { name: /report issue/i })).toBeInTheDocument();
        });

        it("renders status cards", () => {
            render(<CivilianDashboard />);
            expect(screen.getByText("Total")).toBeInTheDocument();
            expect(screen.getByText("In Progress")).toBeInTheDocument();
            expect(screen.getByText("Resolved")).toBeInTheDocument();
        });

        it("renders recent issues section", () => {
            render(<CivilianDashboard />);
            expect(screen.getByText("Recent Issues")).toBeInTheDocument();
        });

        it("renders the issue list", () => {
            render(<CivilianDashboard />);
            expect(screen.getByText("Pothole")).toBeInTheDocument();
        });
    });

    describe("logout", () => {
        it("redirects to /login on logout", () => {
            render(<CivilianDashboard />);
            fireEvent.click(screen.getByLabelText("Logout"));
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    describe("report modal", () => {
        it("opens the report modal when Report Issue is clicked", () => {
            render(<CivilianDashboard />);
            fireEvent.click(screen.getByRole("button", { name: /report issue/i }));
            expect(screen.getByText("Issue Type")).toBeInTheDocument();
        });

        it("closes the modal when Cancel is clicked", () => {
            render(<CivilianDashboard />);
            fireEvent.click(screen.getByRole("button", { name: /report issue/i }));
            fireEvent.click(screen.getByText("Cancel"));
            expect(screen.queryByText("Issue Type")).not.toBeInTheDocument();
        });
    });
});
