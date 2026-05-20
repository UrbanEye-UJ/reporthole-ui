import { render, screen } from "@testing-library/react";
import StatusCard from "@/components/shared/StatusCard";

describe("StatusCard", () => {
    it("renders the value", () => {
        render(<StatusCard label="Total" value="5" />);
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("renders the label", () => {
        render(<StatusCard label="Total" value="5" />);
        expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("renders different values", () => {
        render(<StatusCard label="Resolved" value="12" />);
        expect(screen.getByText("12")).toBeInTheDocument();
        expect(screen.getByText("Resolved")).toBeInTheDocument();
    });
});
