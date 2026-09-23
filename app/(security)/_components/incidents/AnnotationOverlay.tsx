"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import {
  AnnotationBoxRequestClassLabel,
  type AnnotationResponse,
  type IncidentResponseDTOTrainingStatus,
} from "@/app/api/generated/openAPIDefinition.schemas";
import {
  useGetAnnotations,
  useSaveAnnotations,
  useDeleteAnnotation,
  useFlagForTraining,
} from "@/lib/hooks/useAnnotations";
import { getErrorMessage } from "@/lib/getErrorMessage";

type ClassLabel = AnnotationBoxRequestClassLabel;
const CLASS_LABELS = Object.values(AnnotationBoxRequestClassLabel) as ClassLabel[];

/** Kept local rather than shared with `(admin)` — this route group is deliberately self-contained. */
const formatIncidentType = (type?: string) =>
  type ? type.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") : "Unknown";

/** A box in fractional (0–1) top-left coordinates, relative to the image's rendered size. */
interface FractionalBox {
  key: string;
  classLabel: ClassLabel;
  xMin: number;
  yMin: number;
  width: number;
  height: number;
}

const MIN_DRAG_FRACTION = 0.005; // ignore accidental clicks/near-zero drags

function fractionalRectFromEvent(
  container: HTMLElement,
  startClientX: number,
  startClientY: number,
  clientX: number,
  clientY: number
) {
  const rect = container.getBoundingClientRect();
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const x0 = clamp((startClientX - rect.left) / rect.width);
  const y0 = clamp((startClientY - rect.top) / rect.height);
  const x1 = clamp((clientX - rect.left) / rect.width);
  const y1 = clamp((clientY - rect.top) / rect.height);
  return {
    xMin: Math.min(x0, x1),
    yMin: Math.min(y0, y1),
    width: Math.abs(x1 - x0),
    height: Math.abs(y1 - y0),
  };
}

function existingToFractional(a: AnnotationResponse): FractionalBox | null {
  if (
    a.xCenter == null || a.yCenter == null || a.width == null || a.height == null ||
    !a.id || !a.classLabel
  ) {
    return null;
  }
  return {
    key: a.id,
    classLabel: a.classLabel,
    xMin: a.xCenter - a.width / 2,
    yMin: a.yCenter - a.height / 2,
    width: a.width,
    height: a.height,
  };
}

interface AnnotationOverlayProps {
  open: boolean;
  onClose: () => void;
  incidentId: string;
  incidentType?: string;
  imageUrl?: string;
  trainingStatus?: IncidentResponseDTOTrainingStatus;
}

/**
 * Click-drag-release bounding-box editor over an incident's image, for marking up defects to
 * feed the YOLOv8n retraining pipeline. Saving posts the new boxes and flags the incident for
 * training in one action; existing boxes can be removed individually. Security-admin only —
 * annotating and flagging incidents for training is one of the few incident mutations the
 * SECURITY_ADMIN role is allowed to make (see `UserRole` on the backend).
 */
export default function AnnotationOverlay({
  open,
  onClose,
  incidentId,
  incidentType,
  imageUrl,
  trainingStatus,
}: AnnotationOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [pending, setPending] = useState<FractionalBox[]>([]);
  const [draft, setDraft] = useState<{ xMin: number; yMin: number; width: number; height: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [lastClassLabel, setLastClassLabel] = useState<ClassLabel>("POTHOLE");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: annotationsData, isLoading: loadingAnnotations } = useGetAnnotations(open ? incidentId : undefined);
  const existing = useMemo(
    () => (annotationsData?.data ?? []).map(existingToFractional).filter((b): b is FractionalBox => !!b),
    [annotationsData]
  );

  const { mutate: saveAnnotations, isPending: saving } = useSaveAnnotations(incidentId);
  const { mutate: deleteAnnotation, isPending: deleting } = useDeleteAnnotation(incidentId);
  const { mutate: setFlag, isPending: flagging } = useFlagForTraining();

  const isFlagged = trainingStatus === "FLAGGED" || trainingStatus === "EXPORTED";

  const reset = useCallback(() => {
    setPending([]);
    setDraft(null);
    dragStart.current = null;
    setFormError(null);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || saving) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDraft({ xMin: 0, yMin: 0, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current || !containerRef.current) return;
    setDraft(fractionalRectFromEvent(containerRef.current, dragStart.current.x, dragStart.current.y, e.clientX, e.clientY));
  };

  const finishDrag = (clientX: number, clientY: number) => {
    if (!dragStart.current || !containerRef.current) return;
    const rect = fractionalRectFromEvent(containerRef.current, dragStart.current.x, dragStart.current.y, clientX, clientY);
    dragStart.current = null;
    setDraft(null);
    if (rect.width < MIN_DRAG_FRACTION || rect.height < MIN_DRAG_FRACTION) return;
    setPending((prev) => [...prev, { key: `pending-${Date.now()}-${prev.length}`, classLabel: lastClassLabel, ...rect }]);
  };

  const updatePendingLabel = (key: string, classLabel: ClassLabel) => {
    setLastClassLabel(classLabel);
    setPending((prev) => prev.map((b) => (b.key === key ? { ...b, classLabel } : b)));
  };

  const removePending = (key: string) => setPending((prev) => prev.filter((b) => b.key !== key));

  const handleSaveAndFlag = () => {
    setFormError(null);
    if (pending.length === 0) {
      if (existing.length === 0) {
        setFormError("Draw at least one box before saving.");
        return;
      }
      setFlag({ id: incidentId, params: { flagged: true } }, { onError: (err) => setFormError(getErrorMessage(err)) });
      return;
    }
    if (!naturalSize) return;
    saveAnnotations(
      {
        id: incidentId,
        data: {
          imageWidth: Math.round(naturalSize.width),
          imageHeight: Math.round(naturalSize.height),
          boxes: pending.map((b) => ({
            classLabel: b.classLabel,
            x: b.xMin * naturalSize.width,
            y: b.yMin * naturalSize.height,
            width: b.width * naturalSize.width,
            height: b.height * naturalSize.height,
          })),
        },
      },
      {
        onSuccess: () => {
          setPending([]);
          setFlag({ id: incidentId, params: { flagged: true } }, { onError: (err) => setFormError(getErrorMessage(err)) });
        },
        onError: (err) => setFormError(getErrorMessage(err)),
      }
    );
  };

  const handleUnflag = () => {
    setFormError(null);
    setFlag({ id: incidentId, params: { flagged: false } }, { onError: (err) => setFormError(getErrorMessage(err)) });
  };

  const busy = saving || flagging || deleting;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{ transition: { onExited: reset } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <SchoolRoundedIcon color="primary" />
        Annotate — {formatIncidentType(incidentType)}
        {isFlagged && (
          <Chip
            size="small"
            label={trainingStatus === "EXPORTED" ? "Exported" : "Flagged for training"}
            color={trainingStatus === "EXPORTED" ? "default" : "success"}
            sx={{ fontWeight: 600 }}
          />
        )}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click and drag on the image to draw a box around a defect, then pick its type. Save to add the
          boxes and flag this incident for the next YOLO training export.
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        {!imageUrl ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No image available for this incident.
          </Typography>
        ) : (
          <Box
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={(e) => finishDrag(e.clientX, e.clientY)}
            onMouseLeave={() => {
              if (dragStart.current) finishDrag(dragStart.current.x, dragStart.current.y);
            }}
            sx={{
              position: "relative",
              width: "100%",
              lineHeight: 0,
              userSelect: "none",
              cursor: "crosshair",
              borderRadius: 1,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Incident"
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget;
                setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
              }}
              style={{ width: "100%", display: "block", pointerEvents: "none" }}
            />

            {/* Already-saved boxes */}
            {existing.map((box) => (
              <Box
                key={box.key}
                sx={{
                  position: "absolute",
                  left: `${box.xMin * 100}%`,
                  top: `${box.yMin * 100}%`,
                  width: `${box.width * 100}%`,
                  height: `${box.height * 100}%`,
                  border: "2px solid",
                  borderColor: "success.main",
                  boxSizing: "border-box",
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ position: "absolute", top: -1, left: -1, transform: "translateY(-100%)", alignItems: "center" }}
                >
                  <Chip label={formatIncidentType(box.classLabel)} size="small" color="success" sx={{ fontWeight: 600, height: 20 }} />
                  <IconButton
                    size="small"
                    disabled={deleting}
                    onClick={() => deleteAnnotation({ annotationId: box.key })}
                    sx={{ bgcolor: "background.paper", boxShadow: 1, p: 0.25 }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              </Box>
            ))}

            {/* Newly drawn, not-yet-saved boxes */}
            {pending.map((box) => (
              <Box
                key={box.key}
                sx={{
                  position: "absolute",
                  left: `${box.xMin * 100}%`,
                  top: `${box.yMin * 100}%`,
                  width: `${box.width * 100}%`,
                  height: `${box.height * 100}%`,
                  border: "2px dashed",
                  borderColor: "primary.main",
                  boxSizing: "border-box",
                  bgcolor: "rgba(25, 118, 210, 0.08)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  onMouseDown={(e) => e.stopPropagation()}
                  sx={{ position: "absolute", top: -1, left: -1, transform: "translateY(-100%)", alignItems: "center" }}
                >
                  <Select
                    size="small"
                    value={box.classLabel}
                    onChange={(e) => updatePendingLabel(box.key, e.target.value as ClassLabel)}
                    sx={{ height: 24, fontSize: 12, bgcolor: "background.paper" }}
                  >
                    {CLASS_LABELS.map((label) => (
                      <MenuItem key={label} value={label} sx={{ fontSize: 12 }}>
                        {formatIncidentType(label)}
                      </MenuItem>
                    ))}
                  </Select>
                  <IconButton
                    size="small"
                    onClick={() => removePending(box.key)}
                    sx={{ bgcolor: "background.paper", boxShadow: 1, p: 0.25 }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              </Box>
            ))}

            {/* Box currently being dragged */}
            {draft && (
              <Box
                sx={{
                  position: "absolute",
                  left: `${draft.xMin * 100}%`,
                  top: `${draft.yMin * 100}%`,
                  width: `${draft.width * 100}%`,
                  height: `${draft.height * 100}%`,
                  border: "2px dashed",
                  borderColor: "primary.main",
                  boxSizing: "border-box",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>
        )}

        {!loadingAnnotations && existing.length === 0 && pending.length === 0 && imageUrl && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            No boxes yet — draw one on the image above.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {isFlagged && (
          <Button color="inherit" onClick={handleUnflag} disabled={busy} sx={{ mr: "auto" }}>
            Remove from training set
          </Button>
        )}
        <Button onClick={handleClose} disabled={busy}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<SchoolRoundedIcon />}
          onClick={handleSaveAndFlag}
          disabled={busy || !imageUrl || (!naturalSize && pending.length > 0)}
        >
          {saving ? "Saving…" : flagging ? "Flagging…" : "Save & Use for Training"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
