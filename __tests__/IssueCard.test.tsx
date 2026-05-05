import { render, screen } from "@testing-library/react";
import IssueCard from "@/components/shared/IssueCard";
import { Issue } from "@/app/types/issue";

const issue: Issue = {
    id: "1",
    title: "Pothole",
    description: "Large pothole causing damage",
    location: "Johannesburg",
    date: "Apr 26",
    status: "reported",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=200",
};

describe("IssueCard", () => {
    it("renders the issue title", () => {
        render(<IssueCard issue={issue} />);
        expect(screen.getByText("Pothole")).toBeInTheDocument();
    });

    it("renders the description", () => {
        render(<IssueCard issue={issue} />);
        expect(screen.getByText("Large pothole causing damage")).toBeInTheDocument();
    });

    it("renders location and date", () => {
        render(<IssueCard issue={issue} />);
        expect(screen.getByText(/Johannesburg/)).toBeInTheDocument();
        expect(screen.getByText(/Apr 26/)).toBeInTheDocument();
    });

    it("renders an image with the issue title as alt text", () => {
        render(<IssueCard issue={issue} />);
        expect(screen.getByAltText("Pothole")).toBeInTheDocument();
    });
});
