/**
 * Tests for InstallAppButton — renders nothing until the browser fires
 * `beforeinstallprompt`, then triggers the native install flow on click.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InstallAppButton from "@/components/shared/InstallAppButton";

function makeBeforeInstallPromptEvent(prompt: jest.Mock, userChoice: Promise<{ outcome: "accepted" | "dismissed" }>) {
    const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    };
    event.prompt = prompt;
    event.userChoice = userChoice;
    return event;
}

describe("InstallAppButton", () => {
    it("renders nothing before beforeinstallprompt has fired", () => {
        render(<InstallAppButton />);
        expect(screen.queryByRole("button", { name: /install app/i })).not.toBeInTheDocument();
    });

    it("renders and triggers the native prompt once beforeinstallprompt fires", async () => {
        const prompt = jest.fn().mockResolvedValue(undefined);
        const userChoice = Promise.resolve({ outcome: "accepted" as const });

        render(<InstallAppButton />);

        window.dispatchEvent(makeBeforeInstallPromptEvent(prompt, userChoice));

        const button = await screen.findByRole("button", { name: /install app/i });
        const user = userEvent.setup();
        await user.click(button);

        expect(prompt).toHaveBeenCalledTimes(1);
    });

    it("hides the button again after appinstalled fires", async () => {
        const prompt = jest.fn().mockResolvedValue(undefined);
        render(<InstallAppButton />);

        window.dispatchEvent(makeBeforeInstallPromptEvent(prompt, Promise.resolve({ outcome: "accepted" as const })));
        await screen.findByRole("button", { name: /install app/i });

        window.dispatchEvent(new Event("appinstalled"));

        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /install app/i })).not.toBeInTheDocument()
        );
    });
});
