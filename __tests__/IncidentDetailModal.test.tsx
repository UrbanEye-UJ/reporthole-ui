import { render, screen, fireEvent } from "@testing-library/react";
import IncidentDetailModal from "@/components/shared/IncidentDetailModal";
import { Issue } from "@/app/types/issue";

const issue: Issue = {
    id: "abc-123",
    title: "Pothole",
    description: "Large pothole on Main Road",
    location: "-26.2041, 28.0473",
    date: "16 Jun",
    status: "reported",
    image: "/api/image-proxy?url=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fuploads%2Ftest.jpg",
};

describe("IncidentDetailModal", () => {
    it("renders nothing when issue is null", () => {
        const { container } = render(<IncidentDetailModal issue={null} onClose={jest.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders the issue title", () => {
        render(<IncidentDetailModal issue={issue} onClose={jest.fn()} />);
        expect(screen.getByText("Pothole")).toBeInTheDocument();
    });

    it("renders the description", () => {
        render(<IncidentDetailModal issue={issue} onClose={jest.fn()} />);
        expect(screen.getByText("Large pothole on Main Road")).toBeInTheDocument();
    });

    it("renders the location", () => {
        render(<IncidentDetailModal issue={issue} onClose={jest.fn()} />);
        expect(screen.getByText("-26.2041, 28.0473")).toBeInTheDocument();
    });

    it("renders the date", () => {
        render(<IncidentDetailModal issue={issue} onClose={jest.fn()} />);
        expect(screen.getByText("16 Jun")).toBeInTheDocument();
    });

    it("renders the status badge", () => {
        render(<IncidentDetailModal issue={issue} onClose={jest.fn()} />);
        expect(screen.getByText("Reported")).toBeInTheDocument();
    });

    it("renders the image", () => {
        render(<IncidentDetailModal issue={issue} onClose={jest.fn()} />);
        expect(screen.getByAltText("Pothole")).toBeInTheDocument();
    });

    it("calls onClose when the Close button is clicked", () => {
        const onClose = jest.fn();
        render(<IncidentDetailModal issue={issue} onClose={onClose} />);
        fireEvent.click(screen.getByText("Close"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the backdrop is clicked", () => {
        const onClose = jest.fn();
        const { container } = render(<IncidentDetailModal issue={issue} onClose={onClose} />);
        // The backdrop is the outermost div
        fireEvent.click(container.firstChild as Element);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when the modal card itself is clicked", () => {
        const onClose = jest.fn();
        render(<IncidentDetailModal issue={issue} onClose={onClose} />);
        fireEvent.click(screen.getByText("Pothole"));
        expect(onClose).not.toHaveBeenCalled();
    });

    it("renders In Progress status badge correctly", () => {
        render(<IncidentDetailModal issue={{ ...issue, status: "in_progress" }} onClose={jest.fn()} />);
        expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("renders Resolved status badge correctly", () => {
        render(<IncidentDetailModal issue={{ ...issue, status: "resolved" }} onClose={jest.fn()} />);
        expect(screen.getByText("Resolved")).toBeInTheDocument();
    });

    it("shows singular reporter count when 1 person reported", () => {
        render(<IncidentDetailModal issue={{ ...issue, reporterCount: 1 }} onClose={jest.fn()} />);
        expect(screen.getByText("1 person reported this")).toBeInTheDocument();
    });

    it("shows plural reporter count when multiple people reported", () => {
        render(<IncidentDetailModal issue={{ ...issue, reporterCount: 4 }} onClose={jest.fn()} />);
        expect(screen.getByText("4 people reported this")).toBeInTheDocument();
    });

    it("defaults to 1 person reported when reporterCount is undefined", () => {
        const { reporterCount: _, ...issueWithoutCount } = { ...issue, reporterCount: undefined };
        render(<IncidentDetailModal issue={issueWithoutCount} onClose={jest.fn()} />);
        expect(screen.getByText("1 person reported this")).toBeInTheDocument();
    });
});
