import { render, screen, act, fireEvent } from "@testing-library/react";
import SessionExpiryWarning from "@/components/shared/SessionExpiryWarning";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

function makeJwt(exp: number): string {
    const payload = btoa(JSON.stringify({ sub: "user-1", exp }));
    return `header.${payload}.sig`;
}

function setCookie(token: string) {
    Object.defineProperty(document, "cookie", {
        get: () => `reporthole_token=${token}`,
        set: () => {},
        configurable: true,
    });
}

function clearCookie() {
    Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {},
        configurable: true,
    });
}

beforeEach(() => {
    jest.useFakeTimers();
    mockPush.mockReset();
    clearCookie();
});

afterEach(() => {
    jest.useRealTimers();
    clearCookie();
});

describe("SessionExpiryWarning", () => {
    describe("natural expiry (JWT exp clock)", () => {
        it("renders nothing when token is far from expiry", () => {
            setCookie(makeJwt(Math.floor(Date.now() / 1000) + 3600));
            render(<SessionExpiryWarning />);
            expect(screen.queryByText("Session Expiring Soon")).not.toBeInTheDocument();
        });

        it("renders nothing when no token is present", () => {
            render(<SessionExpiryWarning />);
            expect(screen.queryByText(/Session/)).not.toBeInTheDocument();
        });

        it("shows 'Session Expiring Soon' when already inside the warn window", () => {
            setCookie(makeJwt(Math.floor(Date.now() / 1000) + 10));
            render(<SessionExpiryWarning />);
            expect(screen.getByText("Session Expiring Soon")).toBeInTheDocument();
        });

        it("shows warning after the timer fires", async () => {
            setCookie(makeJwt(Math.floor(Date.now() / 1000) + 60));
            render(<SessionExpiryWarning />);
            expect(screen.queryByText("Session Expiring Soon")).not.toBeInTheDocument();

            await act(async () => { jest.advanceTimersByTime(45_000); });

            expect(screen.getByText("Session Expiring Soon")).toBeInTheDocument();
        });

        it("auto-redirects to login when countdown reaches zero", async () => {
            setCookie(makeJwt(Math.floor(Date.now() / 1000) + 5));
            render(<SessionExpiryWarning />);

            await act(async () => { jest.advanceTimersByTime(5000); });

            expect(mockPush).toHaveBeenCalledWith("/login");
        });

        it("redirects immediately when Continue to login is clicked", () => {
            setCookie(makeJwt(Math.floor(Date.now() / 1000) + 10));
            render(<SessionExpiryWarning />);
            fireEvent.click(screen.getByRole("button", { name: /continue to login/i }));
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    describe("session-invalid event (401 from server)", () => {
        it("shows 'Session Expired' when session-invalid event fires", async () => {
            render(<SessionExpiryWarning />);
            expect(screen.queryByText(/Session/)).not.toBeInTheDocument();

            await act(async () => {
                window.dispatchEvent(new CustomEvent("session-invalid"));
            });

            expect(screen.getByText("Session Expired")).toBeInTheDocument();
            expect(screen.getByText(/no longer valid/)).toBeInTheDocument();
        });

        it("counts down and redirects after 15 seconds", async () => {
            render(<SessionExpiryWarning />);

            await act(async () => {
                window.dispatchEvent(new CustomEvent("session-invalid"));
            });

            expect(mockPush).not.toHaveBeenCalled();

            await act(async () => { jest.advanceTimersByTime(15_000); });

            expect(mockPush).toHaveBeenCalledWith("/login");
        });

        it("redirects immediately when Continue to login is clicked", async () => {
            render(<SessionExpiryWarning />);

            await act(async () => {
                window.dispatchEvent(new CustomEvent("session-invalid"));
            });

            fireEvent.click(screen.getByRole("button", { name: /continue to login/i }));
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });
});
