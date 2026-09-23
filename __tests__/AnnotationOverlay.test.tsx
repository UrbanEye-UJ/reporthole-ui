import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AnnotationOverlay from "@/app/(security)/_components/incidents/AnnotationOverlay";
import {
    useGetAnnotations,
    useSaveAnnotations,
    useDeleteAnnotation,
    useFlagForTraining,
} from "@/lib/hooks/useAnnotations";

jest.mock("@/lib/hooks/useAnnotations", () => ({
    useGetAnnotations: jest.fn(),
    useSaveAnnotations: jest.fn(),
    useDeleteAnnotation: jest.fn(),
    useFlagForTraining: jest.fn(),
}));

const mockUseGetAnnotations = useGetAnnotations as jest.Mock;
const mockUseSaveAnnotations = useSaveAnnotations as jest.Mock;
const mockUseDeleteAnnotation = useDeleteAnnotation as jest.Mock;
const mockUseFlagForTraining = useFlagForTraining as jest.Mock;

const IMAGE_URL = "http://host/api/uploads/incidents/abc.jpg";

function renderOverlay(overrides: Partial<React.ComponentProps<typeof AnnotationOverlay>> = {}) {
    return render(
        <AnnotationOverlay
            open
            onClose={jest.fn()}
            incidentId="inc-1"
            incidentType="POTHOLE"
            imageUrl={IMAGE_URL}
            {...overrides}
        />
    );
}

/** Draws a box by simulating mousedown → mousemove → mouseup over the image container. */
async function drawBox(from: [number, number], to: [number, number]) {
    const container = screen.getByRole("img").parentElement as HTMLElement;
    jest.spyOn(container, "getBoundingClientRect").mockReturnValue({
        left: 0, top: 0, width: 400, height: 300, right: 400, bottom: 300, x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(screen.getByRole("img"), "naturalWidth", { value: 800, configurable: true });
    Object.defineProperty(screen.getByRole("img"), "naturalHeight", { value: 600, configurable: true });
    fireEvent.load(screen.getByRole("img"));

    fireEvent.mouseDown(container, { clientX: from[0], clientY: from[1] });
    fireEvent.mouseMove(container, { clientX: to[0], clientY: to[1] });
    fireEvent.mouseUp(container, { clientX: to[0], clientY: to[1] });
}

let saveAnnotations: jest.Mock;
let deleteAnnotation: jest.Mock;
let setFlag: jest.Mock;

beforeEach(() => {
    saveAnnotations = jest.fn((_vars, opts) => opts?.onSuccess?.());
    deleteAnnotation = jest.fn();
    setFlag = jest.fn();

    mockUseGetAnnotations.mockReturnValue({ data: { data: [] }, isLoading: false });
    mockUseSaveAnnotations.mockReturnValue({ mutate: saveAnnotations, isPending: false });
    mockUseDeleteAnnotation.mockReturnValue({ mutate: deleteAnnotation, isPending: false });
    mockUseFlagForTraining.mockReturnValue({ mutate: setFlag, isPending: false });
});

describe("AnnotationOverlay", () => {
    it("requires at least one box before saving", async () => {
        renderOverlay();
        const user = userEvent.setup();

        await user.click(screen.getByRole("button", { name: /save & use for training/i }));

        expect(await screen.findByText("Draw at least one box before saving.")).toBeInTheDocument();
        expect(saveAnnotations).not.toHaveBeenCalled();
        expect(setFlag).not.toHaveBeenCalled();
    });

    it("draws a box, saves normalised YOLO coordinates, then flags the incident", async () => {
        renderOverlay();
        const user = userEvent.setup();

        // 800x600 natural image, container rendered at 400x300 (2x scale) — box from (100,50) to (300,150)
        await drawBox([100, 50], [300, 150]);

        expect(screen.getByRole("combobox")).toBeInTheDocument(); // class-label picker for the pending box

        await user.click(screen.getByRole("button", { name: /save & use for training/i }));

        expect(saveAnnotations).toHaveBeenCalledTimes(1);
        const [{ id, data }] = saveAnnotations.mock.calls[0];
        expect(id).toBe("inc-1");
        expect(data.imageWidth).toBe(800);
        expect(data.imageHeight).toBe(600);
        expect(data.boxes).toHaveLength(1);
        expect(data.boxes[0].classLabel).toBe("POTHOLE");
        expect(data.boxes[0].x).toBeCloseTo(200);
        expect(data.boxes[0].y).toBeCloseTo(100);
        expect(data.boxes[0].width).toBeCloseTo(400);
        expect(data.boxes[0].height).toBeCloseTo(200);
        expect(setFlag).toHaveBeenCalledWith({ id: "inc-1", params: { flagged: true } }, expect.anything());
    });

    it("ignores a near-zero drag (accidental click)", async () => {
        renderOverlay();
        await drawBox([100, 50], [100, 51]);

        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("renders existing annotations and deletes one on click", async () => {
        mockUseGetAnnotations.mockReturnValue({
            data: {
                data: [
                    { id: "ann-1", classLabel: "CRACK", xCenter: 0.5, yCenter: 0.5, width: 0.2, height: 0.2 },
                ],
            },
            isLoading: false,
        });
        renderOverlay();
        const user = userEvent.setup();

        expect(screen.getByText("Crack")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "" })); // the close icon on the existing box

        expect(deleteAnnotation).toHaveBeenCalledWith({ annotationId: "ann-1" });
    });

    it("shows the flagged chip and an unflag action for a FLAGGED incident", async () => {
        renderOverlay({ trainingStatus: "FLAGGED" });
        const user = userEvent.setup();

        expect(screen.getByText("Flagged for training")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /remove from training set/i }));

        expect(setFlag).toHaveBeenCalledWith({ id: "inc-1", params: { flagged: false } }, expect.anything());
    });

    it("shows a message when there is no image to annotate", () => {
        renderOverlay({ imageUrl: undefined });

        expect(screen.getByText("No image available for this incident.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /save & use for training/i })).toBeDisabled();
    });
});
