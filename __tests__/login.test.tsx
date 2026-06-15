import { render, screen, fireEvent, act } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
}));

let capturedOptions: unknown;

jest.mock("@/app/api/generated/authentication/authentication", () => ({
    useLogin: (options: unknown) => {
        capturedOptions = options;
        return { mutate: jest.fn(), isPending: false };
    },
}));

const triggerSuccess = (token: string, role: string) => {
    act(() => {
        capturedOptions.mutation.onSuccess({ data: { token, role } });
    });
};

const triggerError = (status: number) => {
    act(() => {
        capturedOptions.mutation.onError({ response: { status } });
    });
};

beforeEach(() => {
    mockPush.mockClear();
    jest.spyOn(document, "cookie", "set").mockImplementation(() => {});
});

describe("LoginPage", () => {
    it("renders the login form", () => {
        render(<LoginPage />);
        expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    it("shows validation error when fields are empty", () => {
        render(<LoginPage />);
        fireEvent.click(screen.getByRole("button", { name: /login/i }));
        expect(screen.getByText("Please fill in all fields.")).toBeInTheDocument();
    });

    it("routes CIVILIAN to /civilian/dashboard on success", () => {
        render(<LoginPage />);
        triggerSuccess("jwt-token", "CIVILIAN");
        expect(mockPush).toHaveBeenCalledWith("/civilian/dashboard");
    });

    it("routes ADMIN to /admin/dashboard on success", () => {
        render(<LoginPage />);
        triggerSuccess("jwt-token", "ADMIN");
        expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
    });

    it("routes CONTRACTOR to /contractor/dashboard on success", () => {
        render(<LoginPage />);
        triggerSuccess("jwt-token", "CONTRACTOR");
        expect(mockPush).toHaveBeenCalledWith("/contractor/dashboard");
    });

    it("shows not found error on 404", () => {
        render(<LoginPage />);
        triggerError(404);
        expect(screen.getByText("No account found with that email.")).toBeInTheDocument();
    });

    it("shows wrong password error on 400", () => {
        render(<LoginPage />);
        triggerError(400);
        expect(screen.getByText("Incorrect password. Please try again.")).toBeInTheDocument();
    });

    it("shows generic error on unexpected status", () => {
        render(<LoginPage />);
        triggerError(500);
        expect(screen.getByText("Something went wrong. Please try again later.")).toBeInTheDocument();
    });
});
